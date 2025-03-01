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
async function createAssistantAndThread(topic, level) {
    const assistant = await createAssistant(topic, level);
    const thread = await createThread();
    const result = { assistant: assistant, thread: thread };
    return result;
}

async function createAssistant(topic, level) {
    const assistant = await openai.beta.assistants.create({
        name: 'General Tutor',
        instructions:
            `You are a personal tutor teaching a ` +
            level +
            `student about the following subject: ` +
            topic +
            `.`,
        tools: [],
        model: 'gpt-4o-mini'
    });
    return assistant;
}

async function createThread() {
    const thread = await openai.beta.threads.create();
    return thread;
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
 * Skill level tutor functions ---------------------
 */
/**
 * Get skill level AI tutor thread id
 * @param {string} userId
 * @param {string} userId
 * @return {object} database data
 */
async function getSkillThread(userId, skillUrl) {
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

async function saveAITutorSkillThread(data) {
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

async function skillMessage(threadId, assistantId, messageData) {
    // Add a Message to the Thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageData.message
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `Please tutor about the topic: ${messageData.skillName}.
        Tutor the user as if they are at a ${messageData.skillLevel} level and age.
        Make sure to have $ delimiters before any science and math strings that can convert to Latex`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

async function teach(threadId, assistantId, messageData) {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: 'Teach me'
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Teach them about one of the following learning objectives: ${messageData.learningObjectives}.
        Do not ask teach about the same learning objective more than once, until you have taught
        about all the ones in the list.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

async function generateQuestion(threadId, assistantId, messageData) {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: 'Ask me a question'
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
        
        If the student has already shown understanding of a learning objective, do not ask a question about it.
        If the student has not yet shown understanding of a learning objective, do ask a question about it.
        Once the student has shown an understanding of all the learning objectives, let them know they have mastered
        the subject, and stop asking questions.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

// Assess for mastery of skill
async function assess(threadId, assistantId, messageData) {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: 'Do you think I have mastered this topic?'
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Review this chat stream and determine if they have understood and mastered the 
        following learning objectives: ${messageData.learningObjectives}.
        
        If they have, return only the word "yes" and no other words.
        If not, or if it is unclear, let them know that they need to answer more questions correctly.`
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
 * Learning objective level tutor functions --------------------
 */

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

async function learningObjectiveMessage(threadId, assistantId, messageData) {
    // Add a Message to the Thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageData.message
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions:
            `Please do not repeat the question. Please tutor about the topic: ` +
            messageData.learningObjective +
            '. Tutor the user as if they are at a ' +
            messageData.skillLevel +
            ' level and age. Ask follow up questions. Make sure to have $ delimiters before any science and math string that can convert to Latex`'
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];
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
        content: 'Ask me a questions about: ' + messageData.learningObjective
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

module.exports = {
    createAssistantAndThread,
    skillMessage,
    saveAITutorSkillThread,
    getMessagesList,
    getSkillThread,
    getLearningObjectiveThread,
    saveLearningObjectiveThread,
    learningObjectiveMessage,
    generateQuestion,
    generateLearningObjectiveQuestion,
    teach,
    assess
};
