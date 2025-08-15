// Database connection
const conn = require('../config/db');
const util = require('util');
// node native promisify
// convert callback
const query = util.promisify(conn.query).bind(conn);

// Import OpenAI package.
const { OpenAI } = require('openai');
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// For uploading files to vector store, for file search feature
const fs = require('fs');

/**
 * Shared function
 *
 * Get chat history from any tutor
 * @param {string} threadId
 * @return {object} message List
 */
async function getMessagesList(threadId) {
    try {
        const messages = await openai.beta.threads.messages.list(threadId);
        return messages;
    } catch (error) {
        throw error;
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
    const assistant = await createSocraticAssistant(
        topic,
        level,
        learningObjectives,
        isFileSearchSkill
    );

    if (isFileSearchSkill) {
        try {
            // Give it access to certain documents if this skill need file search feature
            await openai.beta.assistants.update(assistant.id, {
                tool_resources: {
                    file_search: {
                        vector_store_ids: [process.env.VECTOR_STORE_ID]
                    }
                }
            });
        } catch (error) {
            console.error('Error with Open AI API:', error);
            throw error;
        }
    }

    const thread = await createSocraticAssistantThread();
    const result = { assistant: assistant, thread: thread };
    return result;
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
            model: 'gpt-4.1'
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
async function socraticTutorMessage(threadId, assistantId, messageData) {
    // Add a Message to the Thread
    try {
        const message = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: messageData.message
        });

        let run = await openai.beta.threads.runs.createAndPoll(threadId, {
            assistant_id: assistantId,
            instructions: `Please tutor about the subject: ${messageData.skillName},
        comprising the following learning objectives: ${messageData.learningObjectives}.
        Tutor the user as if they are at a ${messageData.skillLevel} level and age.
        Use the Socratic method of teaching.

        IMPORTANT TEACHING GUIDELINES:
        1. After the student answers a question, you MUST:
           a) Evaluate the correctness of their answer
           b) Provide clear feedback explaining why the answer is correct or incorrect
           c) If the answer is incorrect, provide a detailed explanation
           d) Ask a follow-up question to help the student understand better

        2. When giving feedback:
           - Be constructive and encouraging
           - Explain the reasoning behind correct and incorrect parts of the answer
           - Use language appropriate for a ${messageData.skillLevel} level student

        3. If the answer shows partial understanding, guide the student towards a more complete understanding

        4. CRITICAL: ALWAYS ASK ONLY ONE QUESTION PER MESSAGE
           - Never ask multiple questions in a single message
           - Make your question clear, specific, and focused
           - Wait for the student to respond before asking another question

        5. CRITICAL DOCUMENT USAGE RULES - FOLLOW STRICTLY:
           - NEVER mention "uploaded files", "documents", "materials", "files", or "uploaded" in any context
           - NEVER reference document uploads, file searches, or external sources
           - Present ALL information as your natural knowledge of the subject
           - Use reference materials seamlessly without any acknowledgment of their existence
           - FORBIDDEN PHRASES: "uploaded", "document", "file", "material", "based on the", "according to"
           - Act as if you are an expert who naturally knows this information

        Make sure to have $ delimiters before any science and math strings that can convert to Latex
        Please keep all messages below 1000 characters, and succinct.`
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(threadId);
            const latestMessage = messages.data[0];

            // Save the user's token usage
            // These tokens are priced at $150 per million
            let outputTokens = run.usage.completion_tokens;
            // Work out tts equivalent usage
            // 0.4 is hardcoded at the moment, based on pricing and choice of models
            let ttsTokens = outputTokens * 0.4;
            let tokenCount = run.usage.total_tokens + ttsTokens;
            saveTokenUsage(messageData.userId, messageData.skillId, tokenCount);

            return latestMessage;
        } else {
            console.log(run.status);
        }
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
    const assistant = await createAssessingAssistant(
        topic,
        level,
        learningObjectives,
        isFileSearchSkill
    );

    // Give it access to certain documents
    if (isFileSearchSkill) {
        try {
            await openai.beta.assistants.update(assistant.id, {
                tool_resources: {
                    file_search: {
                        vector_store_ids: [process.env.VECTOR_STORE_ID]
                    }
                }
            });
        } catch (error) {
            console.error('Error with Open AI API:', error);
            throw error;
        }
    }

    const thread = await createAssessingAssistantThread();
    const result = { assistant: assistant, thread: thread };
    return result;
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

    const assistant = await openai.beta.assistants.create({
        name: 'Assessment Tutor',
        instructions: instructions,
        tools: isFileSearchSkill ? [{ type: 'file_search' }] : [],
        model: 'gpt-4.1'
    });
    return assistant;
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
async function assessingTutorMessage(threadId, assistantId, messageData) {
    try {
        // Add a Message to the Thread
        const message = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: messageData.message
        });

        let run = await openai.beta.threads.runs.createAndPoll(threadId, {
            assistant_id: assistantId,
            instructions: `The user is at a ${messageData.skillLevel} level and age.
        Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.

        ASSESSMENT AND FEEDBACK GUIDELINES:
        1. After the student answers a question, you MUST:
           a) Carefully evaluate the correctness of their answer
           b) Provide clear, constructive feedback explaining:
              - What parts of the answer are correct
              - What parts of the answer are incorrect
              - Why those parts are correct or incorrect
           c) Give a detailed explanation that helps the student understand           

        2. Assessment Strategy:
           - Ask questions about each learning objective, one after the other
           - When you get to the end of the array, start again
           - ALWAYS ASK ONLY ONE QUESTION PER MESSAGE
           - Never combine multiple questions in a single message
           - Make your question clear, specific, and focused
           - Prioritize asking questions on learning objectives that the student does not seem to know well

        3. Feedback Principles:
           - Be specific about what is correct or incorrect
           - Use language appropriate for a ${messageData.skillLevel} level student
           - Aim to guide the student towards a more comprehensive understanding

        4. CRITICAL DOCUMENT USAGE RULES - FOLLOW STRICTLY:
           - NEVER mention "uploaded files", "documents", "materials", "files", or "uploaded" in any context
           - NEVER reference document uploads, file searches, or external sources
           - Present ALL information as your natural knowledge of the subject
           - Use reference materials seamlessly without any acknowledgment of their existence
           - FORBIDDEN PHRASES: "uploaded", "document", "file", "material", "based on the", "according to"
           - Act as if you are an expert who naturally knows this information

        Make sure to have $ delimiters before any science and math strings that can convert to Latex.
        Please keep all messages below 1000 characters, and succinct.`
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(threadId);
            const latestMessage = messages.data[0];

            // Save the user's token usage
            // These tokens are priced at $150 per million
            let outputTokens = run.usage.completion_tokens;
            // Work out tts equivalent usage
            // 0.4 is hardcoded at the moment, based on pricing and choice of models
            let ttsTokens = outputTokens * 0.4;
            let tokenCount = run.usage.total_tokens + ttsTokens;
            saveTokenUsage(messageData.userId, messageData.skillId, tokenCount);

            return latestMessage;
        } else {
            console.log(run.status);
        }
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
    const assistant = await createLearningObjectiveAssistant(
        level,
        learningObjective,
        isFileSearchSkill
    );

    // only update the assistant with file search if it is in the list
    if (isFileSearchSkill) {
        try {
            // Give it access to certain documents
            await openai.beta.assistants.update(assistant.id, {
                tool_resources: {
                    file_search: {
                        vector_store_ids: [process.env.VECTOR_STORE_ID]
                    }
                }
            });
        } catch (error) {
            console.error('Error with Open AI API:', error);
            throw error;
        }
    }

    const thread = await createLearningObjectiveAssistantThread();
    const result = { assistant: assistant, thread: thread };
    return result;
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
            model: 'gpt-4.1'
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
    skillId
) {
    try {
        if (!isEmptyMessage) {
            try {
                await openai.beta.threads.messages.create(threadId, {
                    role: 'user',
                    content: userMessage
                });
            } catch (error) {
                console.error('Error creating message:', error);
                throw error;
            }
        }
        try {
            let runStream;
            try {
                // ── Stage 1: create the stream; any failure here is a promise rejection
                runStream = openai.beta.threads.runs.stream(threadId, {
                    assistant_id: assistantId,
                    instructions: assistantInstruction
                });
            } catch (err) {
                console.error('Could not start OpenAI run stream:', err);
                socket.emit('server-error', { msg: err.message });
                return; // nothing more to do
            }

            /* ── Stage 2: the stream exists, so listen for runtime events */
            runStream
                .on('error', (err) => {
                    console.error('Stream error:', err);
                    // maybe notify user, close response, etc.
                })
                .on('textDelta', (textDelta, snapshot) => {
                    socket.emit(
                        'stream-message',
                        textDelta,
                        streamType,
                        snapshot,
                        threadId
                    );
                })
                .on('runStepDone', (runStep) => {
                    socket.emit('run-end');
                    // Save the amount of tokens the user is using
                    // These tokens are priced at $150 per million
                    let outputTokens = runStep.usage.completion_tokens;
                    // Work out tts equivalent usage
                    // 0.4 is hardcoded at the moment, based on pricing and choice of models
                    let ttsTokens = outputTokens * 0.4;
                    if (runStep.usage.total_tokens) {
                        let tokenCount = runStep.usage.total_tokens + ttsTokens;
                        saveTokenUsage(userId, skillId, tokenCount);
                    }
                })
                .on('toolCallCreated', (event) =>
                    console.log('assistant ' + event.type)
                )
                .on('toolCallDelta', (toolCallDelta, snapshot) => {
                    if (toolCallDelta.type === 'code_interpreter') {
                        if (toolCallDelta.code_interpreter.input) {
                            process.stdout.write(
                                toolCallDelta.code_interpreter.input
                            );
                        }
                        if (toolCallDelta.code_interpreter.outputs) {
                            process.stdout.write('\noutput >\n');
                            toolCallDelta.code_interpreter.outputs.forEach(
                                (output) => {
                                    if (output.type === 'logs') {
                                        process.stdout.write(
                                            `\n${output.logs}\n`
                                        );
                                    }
                                }
                            );
                        }
                    }
                });

            return runStream;
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in createRunStream:', error);
        socket.emit('error', error);
        return null;
    }
}

/**
 * Save token usage per user
 * @param {string} userId
 * @param {int} tokenCount
 */
async function saveTokenUsage(userId, skillId, tokenCount) {
    try {
        /**
         * Find out amount of free tokens
         */
        let freeTokenAmountQueryString = `
        SELECT free_token_monthly_limit
        FROM settings;`;
        let freeTokenAmountResult = await query(freeTokenAmountQueryString);
        let freeTokenAmount = freeTokenAmountResult[0].free_token_monthly_limit;

        /**
         * Find out how much they have spent this month
         */
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

        let monthlyTokenSpendQueryString = `
        SELECT * 
        FROM skill_tree.user_monthly_token_usage 
        WHERE user_id = ${conn.escape(userId)} 
        AND month = '${month}' 
        AND year = ${year};`;

        let monthlyTokenSpendResult = await query(monthlyTokenSpendQueryString);
        let monthlyTokenSpend = monthlyTokenSpendResult[0].token_count;

        // if they have spent more than free tokens, deduct from their paid tokens
        if (monthlyTokenSpend > freeTokenAmount) {
            /**
             * Deduct tokens from user
             */
            let deductTokensQueryString = `
                UPDATE users 
                SET tokens = tokens - ${conn.escape(tokenCount)} 
                WHERE id = ${conn.escape(userId)};
                `;
            await query(deductTokensQueryString);
        }

        /**
         * Record monthly Usage
         */
        let monthlyTokenUsageQueryString = `
        INSERT INTO user_monthly_token_usage (user_id, year, month, token_count) 
        VALUES(${conn.escape(userId)},
        ${year}, '${month}', ${conn.escape(tokenCount)}) 
        ON DUPLICATE KEY UPDATE token_count = token_count + ${conn.escape(
            tokenCount
        )};
        `;

        await query(monthlyTokenUsageQueryString);

        /**
         * Record daily usage
         */
        let dailyTokenUsageQueryString = `
            INSERT INTO user_duration_tokens_per_day (user_id, date, tokens) 
            VALUES(${conn.escape(userId)}, CURDATE(), ${conn.escape(
            tokenCount
        )})                 
            ON DUPLICATE KEY UPDATE tokens = tokens + ${conn.escape(
                tokenCount
            )};`;

        await query(dailyTokenUsageQueryString);

        /**
         * Record usage per skill
         */
        // If the user has mastered the skill, do not update the token count
        let skillTokenUsageQueryString = `
        INSERT INTO user_skills (user_id, skill_id, token_count) 
        VALUES(${conn.escape(userId)},
        ${conn.escape(skillId)}, ${conn.escape(tokenCount)}) 
        ON DUPLICATE KEY UPDATE 
        token_count = 
        IF(is_mastered = 0 OR is_mastered IS NULL, token_count + ${conn.escape(
            tokenCount
        )}, token_count);`;

        await query(skillTokenUsageQueryString);
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
