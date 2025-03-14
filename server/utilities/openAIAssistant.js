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

/**
 * Socratic tutor functions --------------------------------------
 */
async function createSocraticAssistantAndThread(
    topic,
    level,
    learningObjectives
) {
    const assistant = await createSocraticAssistant(
        topic,
        level,
        learningObjectives
    );
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
            `.
            
            Please keep all messages below 2000 characters.`,
        tools: [],
        model: 'o1'
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

async function socraticTutorMessage(threadId, assistantId, messageData) {
    // Add a Message to the Thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageData.message
    });

    console.log('socraticTutorMessage');

    let responseLength = '';
    // regular responses should be short
    if (messageData.isSuggestedInteraction == false) {
        responseLength = 'Please keep all responses succinct.';
    }

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `Please tutor about the subject: ${messageData.skillName}, 
        comprising the following learning objectives: ${messageData.learningObjectives}.
        Tutor the user as if they are at a ${messageData.skillLevel} level and age.
        Ask follow up questions after responding to the message.
        Make sure to have $ delimiters before any science and math strings that can convert to Latex

        Please keep all messages below 2000 characters. ${responseLength}`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];
        return latestMessage;
    } else {
        console.log(run.status);
    }
}

async function createRunStream(
    threadId,
    assistantId,
    userMessage,
    socket,
    assistantInstruction,
    streamType
) {
    await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage
    });

    console.log('stream type: ');
    console.log(streamType);

    const run = openai.beta.threads.runs
        .stream(threadId, {
            assistant_id: assistantId,
            instructions: assistantInstruction
        })
        .on('textDelta', (textDelta, snapshot) => {
            socket.emit('stream-message', textDelta, streamType, snapshot);
        })
        .on('runStepDone', (runStep) => {
            socket.emit('run-end');
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

async function createAssessmentStream(
    threadId,
    assistantId,
    userMessage,
    socket,
    assistantInstruction
) {
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage
    });

    const run = openai.beta.threads.runs
        .stream(threadId, {
            assistant_id: assistantId,
            instructions: assistantInstruction
        })
        .on('textDelta', (textDelta, snapshot) => {
            socket.emit('stream-assessment-message', textDelta, snapshot);
        })
        .on('runStepDone', (runStep) => {
            socket.emit('assessment-run-end');
        });
    return run;
}

async function createRunStream(
    threadId,
    assistantId,
    userMessage,
    socket,
    assistantInstruction,
    streamType
) {
    await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage
    });

    console.log('stream type: ');
    console.log(streamType);

    const run = openai.beta.threads.runs
        .stream(threadId, {
            assistant_id: assistantId,
            instructions: assistantInstruction
        })
        .on('textDelta', (textDelta, snapshot) => {
            socket.emit('stream-message', textDelta, streamType, snapshot);
        })
        .on('runStepDone', (runStep) => {
            socket.emit('run-end');
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

async function createAssessmentStream(
    threadId,
    assistantId,
    userMessage,
    socket,
    assistantInstruction
) {
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage
    });

    const run = openai.beta.threads.runs
        .stream(threadId, {
            assistant_id: assistantId,
            instructions: assistantInstruction
        })
        .on('textDelta', (textDelta, snapshot) => {
            socket.emit('stream-assessment-message', textDelta, snapshot);
        })
        .on('runStepDone', (runStep) => {
            socket.emit('assessment-run-end');
        });
    return run;
}

// Test the student
async function socraticTutorAskQuestion(threadId, assistantId, messageData) {
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
        Ask the student a question related to the content.        
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

/**
 * Assessing tutor functions --------------------------------------
 */
async function createAssessingAssistantAndThread(
    topic,
    level,
    learningObjectives
) {
    const assistant = await createAssessingAssistant(
        topic,
        level,
        learningObjectives
    );
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
            Do not provide any assessment, evaluation or feedback to the student. Only ask questions.
            Please keep all messages below 2000 characters.`,
        tools: [],
        model: 'o1'
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

        Ask questions about each learning objective, one after the other. When you get to the end of the array,
        please start again.
        Only ask one question, not more than one.         
        Preference asking questions on learning objectives that the student does not seem to know well.

        Do not provide feedback to the student after they answer the question.

        Make sure to have $ delimiters before any science and math strings that can convert to Latex.
        Please keep all messages below 2000 characters.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];

        return latestMessage;
    } else {
        console.log(run.status);
    }
}

// Test the student
async function assessingTutorAskQuestion(threadId, assistantId, messageData) {
    if (!messageData.isEmptyMessage) {
        // Add a message to the thread
        const message = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: 'Test me'
        });
    }

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.

        Ask questions about each learning objective, one after the other. When you get to the end of the array,
        please start again.
        Only ask one question, not more than one.        
        Preference asking questions on learning objectives that the student does not seem to know well.

        Do not provide feedback to the student after they answer the question.

        Make sure to have $ delimiters before any science and math strings that can convert to Latex.
        Please keep all messages below 2000 characters.`
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

async function createLearningObjectiveAssistantAndThread(
    learningObjective,
    level
) {
    const assistant = await createLearningObjectiveAssistant(
        level,
        learningObjective
    );
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
        model: 'o1'
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

async function learningObjectiveMessage(threadId, assistantId, messageData) {
    // Add a Message to the Thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: messageData.message
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions:
            `Please do not repeat the request. Please tutor about the topic: ` +
            messageData.learningObjective +
            `. Tutor the user as if they are at a ` +
            messageData.skillLevel +
            ` level and age. Ask follow up questions. Make sure to have $ delimiters before any science and math string that can convert to Latex.
            If the message content is empty, please ask the user to write something.
            Please keep all messages below 2000 characters.`
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        const latestMessage = messages.data[0];
        return latestMessage;
    } else {
        console.log(run.status);
    }
}

async function requestLearningObjectiveTutoring(
    threadId,
    assistantId,
    messageData
) {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: 'Tutor me on this.'
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
        content: 'Ask me a question.'
    });

    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        instructions: `The user is at a ${messageData.skillLevel} level and age.
        Ask them a question about: ${messageData.learningObjective}.`
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
    // Shared
    getMessagesList,
    // Socratic tutor
    createSocraticAssistantAndThread,
    getSocraticTutorThread,
    saveSocraticTutorThread,
    socraticTutorMessage,
    socraticTutorAskQuestion,
    // Assessing tutor
    createAssessingAssistantAndThread,
    getAssessingTutorThread,
    saveAssessingTutorThread,
    assessingTutorMessage,
    assessingTutorAskQuestion,
    // Learning objective tutor
    createLearningObjectiveAssistantAndThread,
    getLearningObjectiveThread,
    saveLearningObjectiveThread,
    learningObjectiveMessage,
    requestLearningObjectiveTutoring,
    generateLearningObjectiveQuestion,
    createRunStream,
    createAssessmentStream
};
