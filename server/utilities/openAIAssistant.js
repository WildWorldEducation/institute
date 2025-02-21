// Database connection
const conn = require('../config/db');

const util = require('util');

// Import OpenAI package.
const { OpenAI } = require('openai');
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// node native promisify
// convert callback
const query = util.promisify(conn.query).bind(conn);

async function createThread() {
    const thread = await openai.beta.threads.create();
    return thread;
}

// TODO specific skill tutor role
async function createAssistant() {
    const assistant = await openai.beta.assistants.create({
        name: 'General Tutor',
        instructions:
            'You are a personal tutor. Answer any questions you are asked..',
        tools: [{ type: 'code_interpreter' }],
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

async function saveAssistantData(data) {
    try {
        let queryString = `INSERT INTO user_assistant_messages (user_id, skill_url, assistant_id, thread_id)
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

async function saveAssistantLearningObjectiveData(data) {
    try {
        let queryString = `INSERT INTO user_learning_objective_assistant_messages (user_id, learning_objective_id, assistant_id, thread_id)
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
 *
 * get user assistant data of the skill
 * @param {string} userId
 * @param {string} skillId
 * @return {*}
 */
async function getAssistantData(userId, skillUrl) {
    try {
        let queryString = `SELECT * 
                           FROM user_assistant_messages 
                           WHERE user_assistant_messages.user_id = ${conn.escape(
                               userId
                           )} AND  user_assistant_messages.skill_url = ${conn.escape(
            skillUrl
        )}`;
        const result = await query(queryString);
        return result;
    } catch (error) {
        throw error;
    }
}

/**
 *
 * get user assistant data of the learning objective
 * @param {string} userId
 * @param {string} skillId
 * @return {*}
 */
async function getAssistantLearningObjectiveData(userId, learningObjectiveId) {
    try {
        let queryString = `SELECT * 
                           FROM user_learning_objective_assistant_messages
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

/**
 *
 * get user assistant data of the skill
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
 *
 * get user assistant data of the skill
 * @param {string} userId
 * @param {string} userId
 * @return {object} database data
 */
async function getAssistantData(userId, skillUrl) {
    try {
        let queryString = `SELECT * 
                           FROM user_assistant_messages 
                           WHERE user_assistant_messages.user_id = ${conn.escape(
                               userId
                           )} AND user_assistant_messages.skill_url = ${conn.escape(
            skillUrl
        )}`;
        const result = await query(queryString);
        return result;
    } catch (error) {
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
