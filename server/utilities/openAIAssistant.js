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
    let stats = fs.statSync('./public/data/uploads/the-martyrdom-of-man.pdf');

    // Use isFile() method to log the result to screen
    console.log('is file ? ' + stats.isFile());

    const fileStreams = [
        './public/data/uploads/the-martyrdom-of-man.pdf',
        './public/data/uploads/the-pragmatist_s-guide-to-life.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-sexuality.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-crafting-religion.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-governance.docx',
        './public/data/uploads/the-pragmatist_s-guide-to-relationships.docx'
    ].map((path) => fs.createReadStream(path));

    // console.log(fileStreams);

    //Create a vector store including our file.
    let vectorStore = await openai.vectorStores.create({
        name: 'Collins Institute Skills Extra Documentation'
    });

    await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
        files: fileStreams
    });

    return vectorStore
    // await openai.beta.assistants.update(assistant.id, {
    //     tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } }
    // });
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
        learningObjectives
    );

    if (isFileSearchSkill) {
        // Give it access to certain documents if this skill need file search feature
        await openai.beta.assistants.update(assistant.id, {
            tool_resources: {
                file_search: { vector_store_ids: [process.env.VECTOR_STORE_ID] }
            }
        });
    }

    const thread = await createSocraticAssistantThread();
    const result = { assistant: assistant, thread: thread };
    return result;
}

async function createSocraticAssistant(topic, level, learningObjectives) {
    const assistant = await openai.beta.assistants.create({
        name: 'Socratic Tutor',
        instructions:
            `You are a personal tutor teaching a ` +
            level +
            `student about the following subject: ` +
            topic +
            `, which consists of the following learning objectives:` +
            learningObjectives +
            `. Use the Socratic method to teach students.
            
            Please keep all messages below 2000 characters.`,
        tools: [{ type: 'file_search' }],
        model: 'gpt-4.5-preview'
    });
    return assistant;
}

async function createSocraticAssistantThread() {
    const thread = await openai.beta.threads.create();
    return thread;
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

        Make sure to have $ delimiters before any science and math strings that can convert to Latex
        Please keep all messages below 2000 characters, and succinct.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        // Save the user's token usage
        let tokenCount = run.usage.total_tokens;
        // console.log(tokenCount);
        saveTokenUsage(messageData.userId, tokenCount);

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

// Test the student
// Commented out as this is now done via streaming/socket.io
// async function socraticTutorAskQuestion(threadId, assistantId, messageData) {
//     let run = await openai.beta.threads.runs.createAndPoll(threadId, {
//         assistant_id: assistantId,
//         instructions: `The user is at a ${messageData.skillLevel} level and age.
//         Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
//         Ask the student a question related to the content.
//         Make sure to have $ delimiters before any science and math strings that can convert to Latex`
//     });

//     if (run.status === 'completed') {
//         const messages = await openai.beta.threads.messages.list(threadId);
//         const latestMessage = messages.data[0];
//         return latestMessage;
//     } else {
//         console.log(run.status);
//     }
// }

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
        learningObjectives
    );

    // Give it access to certain documents
    if (isFileSearchSkill) {
        await openai.beta.assistants.update(assistant.id, {
            tool_resources: {
                file_search: { vector_store_ids: [process.env.VECTOR_STORE_ID] }
            }
        });
    }

    const thread = await createAssessingAssistantThread();
    const result = { assistant: assistant, thread: thread };
    return result;
}

async function createAssessingAssistant(topic, level, learningObjectives) {
    const assistant = await openai.beta.assistants.create({
        name: 'Assessment Tutor',
        instructions:
            `You are responsible for asking questions to assess whether the user understands the following subject:` +
            topic +
            `, which consists of the following learning objectives: ` +
            learningObjectives +
            `, at the following level:` +
            level +
            `.
       
            Please keep all messages below 2000 characters.`,
        tools: [],
        model: 'gpt-4.5-preview'
    });
    return assistant;
}

async function createAssessingAssistantThread() {
    const thread = await openai.beta.threads.create();
    return thread;
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
           - Only ask one question at a time
           - Prioritize asking questions on learning objectives that the student does not seem to know well

        3. Feedback Principles:
           - Be specific about what is correct or incorrect
           - Use language appropriate for a ${messageData.skillLevel} level student
           - Aim to guide the student towards a more comprehensive understanding

        Make sure to have $ delimiters before any science and math strings that can convert to Latex.
        Please keep all messages below 2000 characters, and succinct.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        // Save the user's token usage
        let tokenCount = run.usage.total_tokens;
        console.log(tokenCount);
        saveTokenUsage(messageData.userId, tokenCount);

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

// Test the student
// Commented out as this is now done via streaming/socket.io
// async function assessingTutorAskQuestion(threadId, assistantId, messageData) {
//     let run = await openai.beta.threads.runs.createAndPoll(threadId, {
//         assistant_id: assistantId,
//         instructions: `The user is at a ${messageData.skillLevel} level and age.
//         Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.

//         Ask questions about each learning objective, one after the other. When you get to the end of the array,
//         please start again.
//         Only ask one question, not more than one.
//         Preference asking questions on learning objectives that the student does not seem to know well.

//         Do not provide feedback to the student after they answer the question.

//         Make sure to have $ delimiters before any science and math strings that can convert to Latex.
//         Please keep all messages below 2000 characters.`
//     });

//     if (run.status === 'completed') {
//         const messages = await openai.beta.threads.messages.list(threadId);
//         const latestMessage = messages.data[0];

//         return latestMessage;
//     } else {
//         console.log(run.status);
//     }
// }

/**
 * Learning objective level tutor functions --------------------
 */

async function createLearningObjectiveAssistantAndThread(
    learningObjective,
    level,
    neededFileSearch
) {
    const assistant = await createLearningObjectiveAssistant(
        level,
        learningObjective
    );

    // only update the assistant with file search if it is in the list
    if (neededFileSearch) {
        // Give it access to certain documents
        await openai.beta.assistants.update(assistant.id, {
            tool_resources: {
                file_search: { vector_store_ids: [process.env.VECTOR_STORE_ID] }
            }
        });
    }

    const thread = await createLearningObjectiveAssistantThread();
    const result = { assistant: assistant, thread: thread };
    return result;
}

async function createLearningObjectiveAssistant(level, learningObjective) {
    const assistant = await openai.beta.assistants.create({
        name: 'Learning Objective Tutor',
        instructions:
            `You are a personal tutor teaching a ` +
            level +
            `student about the following subject: ` +
            learningObjective +
            `.
            Please keep all messages below 2000 characters.`,
        tools: [],
        model: 'gpt-4.5-preview'
    });
    return assistant;
}

async function createLearningObjectiveAssistantThread() {
    const thread = await openai.beta.threads.create();
    return thread;
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
        throw error;
    }
}

// async function learningObjectiveMessage(threadId, assistantId, messageData) {
//     // Add a Message to the Thread
//     const message = await openai.beta.threads.messages.create(threadId, {
//         role: 'user',
//         content: messageData.message
//     });

//     let run = await openai.beta.threads.runs.createAndPoll(threadId, {
//         assistant_id: assistantId,
//         instructions:
//             `Please do not repeat the request. Please tutor about the topic: ` +
//             messageData.learningObjective +
//             `. Tutor the user as if they are at a ` +
//             messageData.skillLevel +
//             ` level and age. Ask follow up questions. Make sure to have $ delimiters before any science and math string that can convert to Latex.
//             If the message content is empty, please ask the user to write something.
//             Please keep all messages below 2000 characters.`
//     });

//     if (run.status === 'completed') {
//         const messages = await openai.beta.threads.messages.list(threadId);
//         const latestMessage = messages.data[0];
//         return latestMessage;
//     } else {
//         console.log(run.status);
//     }
// }

async function requestLearningObjectiveTutoring(
    threadId,
    assistantId,
    messageData
) {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: 'tutor me on this'
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Provide a lesson on ${messageData.learningObjective}.
        Please keep the lesson under 2000 characters.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        // Save the user's token usage
        let tokenCount = run.usage.total_tokens;
        console.log(tokenCount);
        saveTokenUsage(messageData.userId, tokenCount);

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

async function generateLearningObjectiveQuestion(
    threadId,
    assistantId,
    messageData
) {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: 'ask me a question'
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Ask them a question about: ${messageData.learningObjective}.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        // Save the user's token usage
        let tokenCount = run.usage.total_tokens;
        console.log(tokenCount);
        saveTokenUsage(messageData.userId, tokenCount);

        return latestMessage;
    } else {
        console.log(run.status);
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
    userId
) {
    console.log('stream type: ');
    console.log(streamType);

    if (!isEmptyMessage) {
        await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: userMessage
        });
    }

    const run = openai.beta.threads.runs
        .stream(threadId, {
            assistant_id: assistantId,
            instructions: assistantInstruction
        })
        .on('textDelta', (textDelta, snapshot) => {
            socket.emit('stream-message', textDelta, streamType, snapshot, threadId);
        })
        .on('runStepDone', (runStep) => {
            socket.emit('run-end');
            // Save the amount of tokens the user is using

            let tokenCount = runStep.usage.total_tokens;
            console.log('streaming: ' + tokenCount);
            saveTokenUsage(userId, tokenCount);
        })
        .on('toolCallCreated', (toolCall) =>
            process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
        )
        .on('toolCallDelta', (toolCallDelta, snapshot) => {
            if (toolCallDelta.type === 'code_interpreter') {
                if (toolCallDelta.code_interpreter.input) {
                    process.stdout.write(toolCallDelta.code_interpreter.input);
                }
                if (toolCallDelta.code_interpreter.outputs) {
                    process.stdout.write('\noutput >\n');
                    toolCallDelta.code_interpreter.outputs.forEach((output) => {
                        if (output.type === 'logs') {
                            process.stdout.write(`\n${output.logs}\n`);
                        }
                    });
                }
            }
        });

    return run;
}

/**
 * Save token usage per user
 * @param {string} userId
 * @param {int} tokenCount
 */
async function saveTokenUsage(userId, tokenCount) {
    try {
        // Update Monthly Usage
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
        let queryString1 = `
        INSERT INTO user_monthly_token_usage (user_id, year, month, token_count) 
        VALUES(${conn.escape(userId)},
        ${year}, '${month}', ${conn.escape(tokenCount)}) 
        ON DUPLICATE KEY UPDATE token_count = token_count + ${conn.escape(
            tokenCount
        )};
        `;

        await query(queryString1);

        // Get the monthly free amount of tokens
        let queryString2 = `
        SELECT monthly_token_limit
        FROM settings;
        `;
        const monthlyFreeLimitResult = await query(queryString2);
        const monthlyFreeLimit = monthlyFreeLimitResult[0].monthly_token_limit;

        // Get the amount of tokens the user has used for the month so far
        let queryString3 = `
        SELECT token_count
        FROM user_monthly_token_usage
        WHERE user_id = '${userId}'
        AND year = ${year}
        AND month = '${month}';
        `;
        const userMonthlyTokenUsageResult = await query(queryString3);
        const userMonthlyTokenUsage =
            userMonthlyTokenUsageResult[0].token_count;

        // Get the amount of tokens the user has used for the month so far
        let queryString4 = `
        SELECT tokens
        FROM users
        WHERE id = '${userId}';
        `;
        const userTokensResult = await query(queryString4);
        let userTokens = userTokensResult[0].tokens;

        // Update the user's tokens
        if (userMonthlyTokenUsage >= monthlyFreeLimit) {
            userTokens = userTokens - tokenCount;
            let queryString5 = `
                UPDATE users
                SET tokens = ${userTokens}
                WHERE id = '${userId}';
        `;

            await query(queryString5);
        }
    } catch (error) {
        throw error;
    }
}


// Get skill data based on thread id
async function getSkillDataByObjectiveId(objectiveId) {
    let queryString = `SELECT * FROM skills JOIN skill_learning_objectives on skills.id = skill_learning_objectives.skill_id WHERE skill_learning_objectives.id = ${objectiveId}`
    const skillData = await query(queryString)
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
    const skillInList = skillsRequiredFileSearch.find((name) => skillName === name);

    return skillInList;
}

// Check if assistant have vector store in their file search tool
function checkAssistantHaveVectorStore(assistantData) {
    if (!assistantData.tool_resources || !assistantData.tool_resources.file_search) {
        // assistant doesn`t use file search
        return false
    }
    const vectorStoreIdArray = assistantData.tool_resources.file_search.vector_store_ids

    const isVectorInArray = vectorStoreIdArray.includes(process.env.VECTOR_STORE_ID);
    return isVectorInArray;
}

async function injectVectorStoreToAssistant(assistantId) {
    await openai.beta.assistants.update(assistantId, {
        tool_resources: { file_search: { vector_store_ids: [process.env.VECTOR_STORE_ID] } },
    });
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
    requestLearningObjectiveTutoring,
    generateLearningObjectiveQuestion,
    createRunStream,
    // To record user's token usage
    saveTokenUsage,
    getSkillDataByObjectiveId,
    checkIfSkillNeedFileSearch,
    uploadAndPollVectorStores,
    checkAssistantHaveVectorStore,
    injectVectorStoreToAssistant
};
