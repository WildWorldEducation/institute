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

/**
 * Shared functions --------------------------------------
 */
async function createThread() {
    const thread = await openai.beta.threads.create();
    return thread;
}

async function createAssistant() {
    const assistant = await openai.beta.assistants.create({
        name: 'General Tutor',
        instructions:
            'You are a personal tutor. Answer any questions you are asked..',
        tools: [],
        model: 'gpt-4o'
    });
    return assistant;
}

async function initialAssistant() {
    const assistant = await createAssistant();
    const thread = await createThread();
    const result = { assistant: assistant, thread: thread };
    return result;
}

/**
 * Get AI tutor messages
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

/**
 * Skill level tutor functions
 */
/**
 * Get skill level AI tutor thread id
 * @param {string} userId
 * @param {string} userId
 * @return {object} database data
 */
async function getAssistantData(userId, skillUrl) {
    try {
        let queryString = `SELECT * 
                           FROM ai_tutor_skill_threads 
                           WHERE user_id = ${conn.escape(
                               userId
                           )} AND skill_url = ${conn.escape(skillUrl)}`;
        const result = await query(queryString);
        return result;
    } catch (error) {
        throw error;
    }
}

async function saveAssistantData(data) {
    try {
        let queryString = `INSERT INTO ai_tutor_skill_threads (user_id, skill_url, assistant_id, thread_id)
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

async function processingNewMessage(threadId, assistantId, messageData) {
    // Add a Message to the Thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageData.message
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `Please return the message as formatted html code. Please refer to the user as ${messageData.userName}. Please only talk about the topic: ${messageData.skillName};`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

/**
 * Learning objective level tutor functions
 */
/**
 * Get learning objective level AI tutor thread id
 * @param {string} userId
 * @param {string} learningObjectiveId
 * @return {*}
 */
async function getAssistantLearningObjectiveData(userId, learningObjectiveId) {
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

async function processingNewLearningObjectiveExplanation(
    threadId,
    assistantId,
    messageData
) {
    // Add a Message to the Thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageData.learningObjective
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `Please do not repeat the question.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

async function saveAssistantLearningObjectiveData(data) {
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

module.exports = {
    initialAssistant,
    processingNewMessage,
    saveAssistantData,
    getAssistantData,
    getMessagesList,
    getAssistantData,
    getAssistantLearningObjectiveData,
    saveAssistantLearningObjectiveData,
    processingNewLearningObjectiveExplanation
};
