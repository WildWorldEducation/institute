// Database connection
const conn = require('../config/db');
const util = require('util');
// node native promisify
// convert callback
const query = util.promisify(conn.query).bind(conn);

// Shared OpenAI client (kept for TTS/STT/embeddings) + Grok client (tutors) + models.
const { openai, grok, models } = require('../config/aiConfig');
// RFab usage-event tracking (tracking-only; never sends user content).
const { emitUsageEvent } = require('./rfabUsageTracker');
// Grok tutor engine — chat-completions + streaming + local history persistence.
const grokTutor = require('./grokTutor');

// For uploading files to vector store, for file search feature
const fs = require('fs');

/**
 * Shared function
 *
 * Get chat history from any tutor. Reads from the local ai_tutor_messages store
 * (Grok is stateless) and returns the OpenAI-Assistants-compatible shape the
 * routes/frontend expect: newest-first, content[].text.value.
 * @param {string} threadId
 * @return {object} message List
 */
async function getMessagesList(threadId) {
    try {
        // grokTutor.loadHistory returns the conversation oldest-first from the DB
        // table if it exists, otherwise from in-memory history. Reverse to
        // newest-first to match the OpenAI messages.list shape the routes expect.
        const history = await grokTutor.loadHistory(threadId); // [{ role, content }]
        const data = history
            .slice()
            .reverse()
            .map((m, i) => ({
                id: String(i),
                role: m.role,
                content: [
                    { type: 'text', text: { value: m.content, annotations: [] } }
                ]
            }));
        return { data };
    } catch (error) {
        console.error('[openAIAssistant] getMessagesList failed:', error.message);
        return { data: [] };
    }
}

//uploadAndPollVectorStores();
/**
 * File search feature - upload the files
 */
async function uploadAndPollVectorStores() {
    const fileStreams = [
        './public/data/uploads/the-martyrdom-of-man.pdf',
        './public/data/uploads/the-pragmatist_s-guide-to-life.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-sexuality.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-crafting-religion.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-governance.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-relationships.docx'
    ].map((path) => fs.createReadStream(path));

    try {
        //Create a vector store including our file.
        let vectorStore = await openai.vectorStores.create({
            name: 'Collins Institute Skills Extra Documentation'
        });

        await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
            files: fileStreams
        });
    } catch (error) {
        console.error('Error creating vector store:', error);
        throw error;
    }

    return vectorStore;
}

/**
 * Socratic tutor functions --------------------------------------
 */
async function createSocraticAssistantAndThread(
    topic,
    level,
    learningObjectives,
    isFileSearchSkill
) {
    // Grok is stateless — no remote assistant/thread. Generate local ids; the
    // system prompt is supplied per-turn (socketConfig) and conversation history
    // is persisted in ai_tutor_messages. Live web search replaces the old
    // vector-store file-search for document-backed skills.
    return { assistant: { id: grokTutor.newId() }, thread: { id: grokTutor.newId() } };
}

async function createSocraticAssistant(
    topic,
    level,
    learningObjectives,
    isFileSearchSkill
) {
    // Build the base instruction
    let instructions = `You are a personal tutor teaching a ${level} student about the following subject: ${topic}, which consists of the following learning objectives: ${learningObjectives}. Use the Socratic method to teach students.

            IMPORTANT GUIDELINES:
            - Always ask ONLY ONE QUESTION per message
            - Make your question clear, focused, and specific
            - Never ask multiple questions in the same message, even if they are related
            - Wait for the student's response before asking another question
            - Focus on depth rather than breadth in your questions
            - Act as if you are having a natural conversation with the student
            - DO NOT reference "learning objectives", "context provided", "materials given", or any backend data
            - DO NOT mention that you have been given specific information or guidelines
            - Speak naturally as if you are simply knowledgeable about the topic

            Please keep all messages below 1000 characters.`;

    // Add file search specific instructions
    if (isFileSearchSkill) {
        instructions += `
            
            CRITICAL DOCUMENT USAGE RULES - FOLLOW STRICTLY:
            - NEVER mention "uploaded files", "documents", "materials", "files", or "uploaded" in any context
            - NEVER reference document uploads, file searches, or external sources
            - Present ALL information as your natural knowledge of the subject
            - Use reference materials seamlessly without any acknowledgment of their existence
            - If you have specialized knowledge, present it as if it's part of your training
            - FORBIDDEN PHRASES: "uploaded", "document", "file", "material", "based on the", "according to"
            - Act as if you are an expert who naturally knows this information`;
    }
    try {
        const assistant = await openai.beta.assistants.create({
            name: 'Socratic Tutor',
            instructions: instructions,
            tools: isFileSearchSkill ? [{ type: 'file_search' }] : [],
            model: models.tutor
        });
        return assistant;
    } catch (error) {
        console.error('Error with Open AI API:', error);
        throw error;
    }
}

async function createSocraticAssistantThread() {
    try {
        const thread = await openai.beta.threads.create();
        return thread;
    } catch (error) {
        console.error('Error with Open AI API:', error);
        throw error;
    }
}

/**
 * Get Socractic tutor thread id
 * @param {string} userId
 * @param {string} userId
 * @return {object} database data
 */
async function getSocraticTutorThread(userId, skillUrl) {
    try {
        let queryString = `SELECT * 
                           FROM ai_socratic_tutor_threads 
                           WHERE user_id = ${conn.escape(
            userId
        )} AND skill_url = ${conn.escape(skillUrl)}`;

        const result = await query(queryString);
        return result;
    } catch (error) {
        throw error;
    }
}

async function saveSocraticTutorThread(data) {
    try {
        let queryString = `INSERT INTO ai_socratic_tutor_threads (user_id, skill_url, assistant_id, thread_id)
               VALUES (
               ${conn.escape(data.userId)},
               ${conn.escape(data.skillUrl)},
               ${conn.escape(data.assistantId)},
               ${conn.escape(data.threadId)}
               );`;
        await query(queryString);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Only used for Speech to Text at the moment
async function socraticTutorMessage(
    threadId,
    assistantId,
    messageData,
    freeMonthlyTokenLimit,
    monthlyTokenUsage,
    billingMode,
    tenantId
) {
    try {
        const systemInstruction =
            'Please tutor about the subject: ' + messageData.skillName +
            ', comprising the following learning objectives: ' + messageData.learningObjectives +
            '. Tutor the user as if they are at a ' + messageData.skillLevel + ' level and age.' +
            ' Use the Socratic method. After the student answers, evaluate correctness, give clear' +
            ' feedback, and ask ONE follow-up question. Ask ONLY ONE QUESTION per message. Speak' +
            ' naturally; do not reference learning objectives, materials, or backend data. Use $' +
            ' delimiters for math/science that converts to LaTeX. Keep messages below 1000 characters.';
        const { text, usage } = await grokTutor.completeTutorTurn({
            threadId,
            userMessage: messageData.message,
            systemInstruction
        });
        if (usage && usage.total_tokens) {
            const ttsTokens = (usage.completion_tokens || 0) * 0.4;
            const tokenCount = usage.total_tokens + ttsTokens;
            saveTokenUsage(messageData.userId, messageData.skillId, tokenCount, freeMonthlyTokenLimit, monthlyTokenUsage, billingMode, tenantId);
            emitUsageEvent({ userId: messageData.userId, eventType: 'ai_tutor_message', metadata: { skillId: messageData.skillId, tenantId, billingMode, feature: 'stt_tutor', model: models.grokTutor, tokenCount, promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens } });
        }
        return { role: 'assistant', content: [{ type: 'text', text: { value: text, annotations: [] } }] };
    } catch (error) {
        console.error('Error in socraticTutorMessage:', error);
        throw error;
    }
}

/**
 * Assessing tutor functions --------------------------------------
 */
async function createAssessingAssistantAndThread(
    topic,
    level,
    learningObjectives,
    isFileSearchSkill
) {
    // Grok is stateless — local ids only (see createSocraticAssistantAndThread).
    return { assistant: { id: grokTutor.newId() }, thread: { id: grokTutor.newId() } };
}

async function createAssessingAssistant(
    topic,
    level,
    learningObjectives,
    isFileSearchSkill
) {
    // Build the base instruction
    let instructions = `You are responsible for asking questions to assess whether the user understands the following subject: ${topic}, which consists of the following learning objectives: ${learningObjectives}, at the following level: ${level}.

            IMPORTANT ASSESSMENT GUIDELINES:
            - Always ask ONLY ONE QUESTION at a time
            - Never combine multiple questions in a single message
            - Make your questions clear, specific, and focused
            - After receiving an answer, provide feedback before asking the next question
            - Assess one concept at a time
            - Act as if you are having a natural conversation with the student
            - DO NOT reference "learning objectives", "context provided", "materials given", or any backend data
            - DO NOT mention that you have been given specific information or guidelines
            - Speak naturally as if you are simply knowledgeable about the topic
       
            Please keep all messages below 1000 characters.`;

    // Add file search specific instructions
    if (isFileSearchSkill) {
        instructions += `
            
            CRITICAL DOCUMENT USAGE RULES - FOLLOW STRICTLY:
            - NEVER mention "uploaded files", "documents", "materials", "files", or "uploaded" in any context
            - NEVER reference document uploads, file searches, or external sources
            - Present ALL information as your natural knowledge of the subject
            - Use reference materials seamlessly without any acknowledgment of their existence
            - If you have specialized knowledge, present it as if it's part of your training
            - FORBIDDEN PHRASES: "uploaded", "document", "file", "material", "based on the", "according to"
            - Act as if you are an expert who naturally knows this information`;
    }
    try {
        const assistant = await openai.beta.assistants.create({
            name: 'Assessment Tutor',
            instructions: instructions,
            tools: isFileSearchSkill ? [{ type: 'file_search' }] : [],
            model: models.tutor
        });
        return assistant;
    } catch (error) {
        console.error('Error with Open AI API:', error)
        throw error
    }

}

async function createAssessingAssistantThread() {
    try {
        const thread = await openai.beta.threads.create();
        return thread;
    } catch (error) {
        console.error('Error with Open AI API:', error);
        throw error;
    }
}

/**
 * Get Assessing tutor thread id
 * @param {string} userId
 * @param {string} userId
 * @return {object} database data
 */
async function getAssessingTutorThread(userId, skillUrl) {
    try {
        let queryString = `SELECT * 
                           FROM ai_assessing_tutor_threads 
                           WHERE user_id = ${conn.escape(
            userId
        )} AND skill_url = ${conn.escape(skillUrl)}`;

        const result = await query(queryString);
        return result;
    } catch (error) {
        throw error;
    }
}

async function saveAssessingTutorThread(data) {
    try {
        let queryString = `INSERT INTO ai_assessing_tutor_threads (user_id, skill_url, assistant_id, thread_id)
               VALUES (
               ${conn.escape(data.userId)},
               ${conn.escape(data.skillUrl)},
               ${conn.escape(data.assistantId)},
               ${conn.escape(data.threadId)}
               );`;
        await query(queryString);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Only used for Speech to text
async function assessingTutorMessage(
    threadId,
    assistantId,
    messageData,
    freeMonthlyTokenLimit,
    monthlyTokenUsage,
    billingMode,
    tenantId
) {
    try {
        const systemInstruction =
            'The user is at a ' + messageData.skillLevel + ' level and age. Review the chat history' +
            ' and these learning objectives: ' + messageData.learningObjectives + '. Ask questions to' +
            ' assess understanding, one learning objective at a time, looping when you reach the end.' +
            ' Ask ONLY ONE QUESTION per message. After each answer, say what was correct/incorrect and' +
            ' why. Speak naturally; do not reference learning objectives, materials, or backend data.' +
            ' Use $ delimiters for math/science that converts to LaTeX. Keep messages below 1000 characters.';
        const { text, usage } = await grokTutor.completeTutorTurn({
            threadId,
            userMessage: messageData.message,
            systemInstruction
        });
        if (usage && usage.total_tokens) {
            const ttsTokens = (usage.completion_tokens || 0) * 0.4;
            const tokenCount = usage.total_tokens + ttsTokens;
            saveTokenUsage(messageData.userId, messageData.skillId, tokenCount, freeMonthlyTokenLimit, monthlyTokenUsage, billingMode, tenantId);
            emitUsageEvent({ userId: messageData.userId, eventType: 'ai_tutor_message', metadata: { skillId: messageData.skillId, tenantId, billingMode, feature: 'stt_tutor', model: models.grokTutor, tokenCount, promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens } });
        }
        return { role: 'assistant', content: [{ type: 'text', text: { value: text, annotations: [] } }] };
    } catch (error) {
        console.error('Error in assessingTutorMessage:', error);
        throw error;
    }
}

/**
 * Learning objective level tutor functions --------------------
 */

async function createLearningObjectiveAssistantAndThread(
    learningObjective,
    level,
    isFileSearchSkill
) {
    // Grok is stateless - local ids only (see createSocraticAssistantAndThread).
    return { assistant: { id: grokTutor.newId() }, thread: { id: grokTutor.newId() } };
}

async function createLearningObjectiveAssistant(
    level,
    learningObjective,
    isFileSearchSkill
) {
    // Build the base instruction
    let instructions = `You are a personal tutor teaching a ${level} student about the following subject: ${learningObjective}.
            
            IMPORTANT GUIDELINES:
            - Always ask ONLY ONE QUESTION per message
            - Make your question clear, specific, and focused
            - Never combine multiple questions in a single message, even if they are related
            - Wait for the student's response before asking a new question
            - Build questions that help the student reach a deeper understanding
            - Act as if you are having a natural conversation with the student
            - DO NOT reference "learning objectives", "context provided", "materials given", or any backend data
            - DO NOT mention that you have been given specific information or guidelines
            - Speak naturally as if you are simply knowledgeable about the topic
            
            Please keep all messages below 1000 characters.`;

    // Add file search specific instructions
    if (isFileSearchSkill) {
        instructions += `
            
            CRITICAL DOCUMENT USAGE RULES - FOLLOW STRICTLY:
            - NEVER mention "uploaded files", "documents", "materials", "files", or "uploaded" in any context
            - NEVER reference document uploads, file searches, or external sources
            - Present ALL information as your natural knowledge of the subject
            - Use reference materials seamlessly without any acknowledgment of their existence
            - If you have specialized knowledge, present it as if it's part of your training
            - FORBIDDEN PHRASES: "uploaded", "document", "file", "material", "based on the", "according to"
            - Act as if you are an expert who naturally knows this information`;
    }

    try {
        const assistant = await openai.beta.assistants.create({
            name: 'Learning Objective Tutor',
            instructions: instructions,
            tools: isFileSearchSkill ? [{ type: 'file_search' }] : [],
            model: models.tutor
        });
        return assistant;
    } catch (error) {
        console.error('Error with Open AI API:', error);
        throw error;
    }
}

async function createLearningObjectiveAssistantThread() {
    try {
        const thread = await openai.beta.threads.create();
        return thread;
    } catch (error) {
        console.error('Error with Open AI API:', error);
        throw error;
    }
}

async function saveLearningObjectiveThread(data) {
    try {
        let queryString = `INSERT INTO ai_tutor_learning_objective_threads (user_id, learning_objective_id, assistant_id, thread_id)
               VALUES (
               ${conn.escape(data.userId)},
               ${conn.escape(data.learningObjectiveId)},
               ${conn.escape(data.assistantId)},
               ${conn.escape(data.threadId)}
               );`;
        await query(queryString);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Get learning objective level AI tutor thread id
 * @param {string} userId
 * @param {string} learningObjectiveId
 * @return {*}
 */
async function getLearningObjectiveThread(userId, learningObjectiveId) {
    try {
        let queryString = `SELECT * 
                           FROM ai_tutor_learning_objective_threads
                           WHERE user_id = ${conn.escape(
            userId
        )} AND learning_objective_id = ${conn.escape(
            learningObjectiveId
        )}`;

        const result = await query(queryString);

        return result;
    } catch (error) {
        console.error('Error in getLearningObjectiveThread:', error);
        throw error;
    }
}

// Chat streaming

async function createRunStream(
    threadId,
    assistantId,
    userMessage,
    isEmptyMessage,
    socket,
    assistantInstruction,
    streamType,
    userId,
    skillId,
    freeMonthlyTokenLimit,
    monthlyTokenUsage,
    billingMode,
    tenantId
) {
    try {
        // Grok streaming turn (replaces the OpenAI Assistants run). grokTutor
        // persists user + assistant messages to ai_tutor_messages, replays history
        // each turn, and emits the SAME socket events the frontend expects:
        // 'stream-message' (delta, streamType, snapshot, threadId) and 'run-end'.
        const { usage } = await grokTutor.streamTutorTurn({
            threadId,
            userMessage,
            isEmptyMessage,
            socket,
            systemInstruction: assistantInstruction,
            streamType
        });

        if (usage && usage.total_tokens) {
            // 0.4 = TTS-equivalent uplift retained from the prior pricing model.
            const outputTokens = usage.completion_tokens || 0;
            const ttsTokens = outputTokens * 0.4;
            const tokenCount = usage.total_tokens + ttsTokens;
            saveTokenUsage(
                userId,
                skillId,
                tokenCount,
                freeMonthlyTokenLimit,
                monthlyTokenUsage,
                billingMode,
                tenantId
            );
            emitUsageEvent({
                userId,
                eventType: 'ai_tutor_message',
                metadata: {
                    skillId,
                    tenantId,
                    billingMode,
                    streamType,
                    model: models.grokTutor,
                    tokenCount,
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens
                }
            });
        }
        return null;
    } catch (error) {
        console.error('Error in createRunStream:', error);
        socket.emit('server-error', { msg: error.message });
        return null;
    }
}

/**
 * Save token usage per user
 * @param {string} userId
 * @param {int} tokenCount
 */
async function saveTokenUsage(
    userId,
    skillId,
    tokenCount,
    freeMonthlyTokenLimit,
    monthlyTokenUsage,
    billingMode,
    tenantId
) {
    try {
        // Get current year
        let year = new Date().getFullYear();
        // Get current month
        const monthName = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        const d = new Date();
        let month = monthName[d.getMonth()];


        // Using a stored procedure to to reduce network calls from 4 to 1
        await conn.query('CALL save_token_usage(?, ?, ?, ?, ?, ?, ?)', [
            userId,
            tokenCount,
            skillId,
            year,
            month,
            billingMode,
            tenantId
        ]);


    } catch (error) {
        console.error('Error in saveTokenUsage:', error);
        throw error;
    }
}

// Get skill data based on thread id
async function getSkillDataByObjectiveId(objectiveId) {
    let queryString = `SELECT * FROM skills JOIN skill_learning_objectives on skills.id = skill_learning_objectives.skill_id WHERE skill_learning_objectives.id = ${objectiveId}`;
    const skillData = await query(queryString);
    return skillData[0];
}

// Check if skill is needed to add file search feature into it assistant
function checkIfSkillNeedFileSearch(skillName) {
    // HARD CODE IS BAD BUT I DON`T THINK ADD THIS TO ENV IS A BETTER IDEA
    const skillsRequiredFileSearch = [
        'The Martyrdom of Man',
        'Life Optimization(Intro)',
        'Objective Functions',
        'Choosing an Objective Function',
        'Choosing How to Determine What is True',
        'Define Your Internal Character',
        'Choosing How You Want Others to See You',
        'Choose a Culture',
        'Types of Friends',
        'Dating Marketplaces',
        'Types of Lures',
        'Relationship Structures',
        'Marriage Contracts',
        'Avoiding Bad Relationships',
        'Human Sexuality',
        'The Evolution of Sexuality',
        'Mate Guarding & Slut Shaming',
        'Why did Sex Evolve',
        'Sexual Selection, Gender Transitions, and Sneaky Copulation',
        'The Evolution of Kinks',
        'Memetics',
        'Cultural Evolution',
        'The Memetic Supervirus'
    ];
    const skillInList = skillsRequiredFileSearch.find(
        (name) => skillName === name
    );

    return skillInList;
}

// Check if assistant have vector store in their file search tool
function checkAssistantHaveVectorStore(assistantData) {
    if (
        !assistantData.tool_resources ||
        !assistantData.tool_resources.file_search
    ) {
        // assistant doesn`t use file search
        return false;
    }
    const vectorStoreIdArray =
        assistantData.tool_resources.file_search.vector_store_ids;

    const isVectorInArray = vectorStoreIdArray.includes(
        process.env.VECTOR_STORE_ID
    );
    return isVectorInArray;
}

async function injectVectorStoreToAssistant(assistantId) {
    try {
        await openai.beta.assistants.update(assistantId, {
            tool_resources: {
                file_search: { vector_store_ids: [process.env.VECTOR_STORE_ID] }
            }
        });
    } catch (error) {
        console.error('Error with Open AI API:', error);
        throw error;
    }
}

module.exports = {
    // Shared
    getMessagesList,
    // Socratic tutor
    createSocraticAssistantAndThread,
    getSocraticTutorThread,
    saveSocraticTutorThread,
    socraticTutorMessage,
    // Assessing tutor
    createAssessingAssistantAndThread,
    getAssessingTutorThread,
    saveAssessingTutorThread,
    assessingTutorMessage,
    // Learning objective tutor
    createLearningObjectiveAssistantAndThread,
    getLearningObjectiveThread,
    saveLearningObjectiveThread,
    createRunStream,
    // To record user's token usage
    saveTokenUsage,
    getSkillDataByObjectiveId,
    checkIfSkillNeedFileSearch,
    uploadAndPollVectorStores,
    checkAssistantHaveVectorStore,
    injectVectorStoreToAssistant
};
