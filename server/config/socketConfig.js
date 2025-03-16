const { Server } = require('socket.io');
const {
    // getSkillThread,
    createRunStream
    //  createAssistantAndThread,
    //  saveAITutorSkillThread,
    //createAssessmentStream
} = require('../utilities/openAIAssistant');

let io = null;

const createSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        try {
            // user send normal message event
            socket.on('new-message', async (messageData, callback) => {
                // This has to do with when the user presses "send" with no message.
                const isEmptyMessage = false;
                // Assistant instructions
                let instructions = '';
                if (messageData.tutorType == 'socratic') {
                    instructions = `Please tutor about the subject: ${messageData.skillName},
                comprising the following learning objectives: ${messageData.learningObjectives}.
                Tutor the user as if they are at a ${messageData.skillLevel} level and age.
                Ask follow up questions after responding to the message.
                Make sure to have $ delimiters before any science and math strings that can convert to Latex
                Please keep all messages below 2000 characters. ${messageData.responseLength}`;
                } else if (messageData.tutorType == 'assessing') {
                    instructions = `The user is at a ${messageData.skillLevel} level and age.
                Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.

                Ask questions about each learning objective, one after the other. When you get to the end of the array,
                please start again.
                Only ask one question, not more than one.
                Preference asking questions on learning objectives that the student does not seem to know well.

                Do not provide feedback to the student after they answer the question.

                Make sure to have $ delimiters before any science and math strings that can convert to Latex.
                Please keep all messages below 2000 characters.`;
                }

                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    messageData.message,
                    isEmptyMessage,
                    socket,
                    instructions,
                    'aiTutor'
                );
            });

            // user send test me message event
            socket.on('ask-question', async (messageData, callback) => {
                // This has to do with when the user presses "send" with no message.
                const isEmptyMessage = true;
                // Assistant instructions
                let instructions = '';
                if (messageData.tutorType == 'socratic') {
                    instructions = `
                    The user is at a ${messageData.skillLevel} level and age.
                    Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
                    Ask the student a question related to the content.        
                    Make sure to have $ delimiters before any science and math strings that can convert to Latex
                    `;
                } else {
                    instructions = `The user is at a ${messageData.skillLevel} level and age.
                    Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
               
                    Ask questions about each learning objective, one after the other. When you get to the end of the array,
                    please start again.
                    Only ask one question, not more than one.        
                    Preference asking questions on learning objectives that the student does not seem to know well.
               
                    Do not provide feedback to the student after they answer the question.
               
                    Make sure to have $ delimiters before any science and math strings that can convert to Latex.
                    Please keep all messages below 2000 characters.`;
                }

                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    messageData.message,
                    isEmptyMessage,
                    socket,
                    instructions,
                    'aiTutor'
                );
            });

            // learning objective message
            socket.on('new-learning-objective-message', async (messageData) => {
                // This has to do with when the user presses "send" with no message.
                const isEmptyMessage = false;
                const assistantInstruction = `Please do not repeat the request. Please tutor about the topic: 
                    ${messageData.learningObjective}. Tutor the user as if they are at a ${messageData.skillLevel}
                    level and age. Ask follow up questions. Make sure to have $ delimiters before any science and math string that can convert to Latex.
                    If the message content is empty, please ask the user to write something.
                    Please be succinct, brief and clear.`;

                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    messageData.message,
                    isEmptyMessage,
                    socket,
                    assistantInstruction,
                    'learningObjective'
                );
            });
        } catch (error) {
            socket.emit('error', error);
            console.error(error);
        }
    });
};

module.exports = { createSocket };
