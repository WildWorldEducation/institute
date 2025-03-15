const { Server } = require('socket.io');
const {
    // getSkillThread,
    createRunStream
    //  createAssistantAndThread,
    //  saveAITutorSkillThread,
    //createAssessmentStream
} = require('../utilities/openAIAssistant');

let io = null;

// const getAssistantData = async (
//     userId,
//     skillId,
//     skillName,
//     skillLevel,
//     skillUrl
// ) => {
//     const assistantData = await getSkillThread(skillId, userId, skillUrl);
//     if (assistantData.length === 0) {
//         const newAssistant = await createAssistantAndThread(
//             skillName,
//             skillLevel
//         );
//         const newAssistantData = {
//             userId: userId,
//             skillUrl: skillUrl,
//             assistantId: newAssistant.assistant.id,
//             threadId: newAssistant.thread.id
//         };
//         await saveAITutorSkillThread(newAssistantData);
//         return newAssistantData;
//     } else {
//         return {
//             assistantId: assistantData[0].assistant_id,
//             threadId: assistantData[0].thread_id
//         };
//     }
// };

const createSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        try {
            // user send normal message event
            socket.on('new-message', async (messageData, callback) => {
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
                    messageData.isEmptyMessage,
                    socket,
                    instructions,
                    'aiTutor'
                );
            });

            // user send test me message event
            socket.on('ask-question', async (messageData, callback) => {
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
                    messageData.isEmptyMessage,
                    socket,
                    instructions,
                    'aiTutor'
                );
            });

            // user send teach me message event
            socket.on('teach-request', async (messageData, callback) => {
                const assistantInstruction = `The user is at a ${messageData.skillLevel} level and age.
        Teach them about one of the following learning objectives: ${messageData.learningObjectives}.
        Do not ask teach about the same learning objective more than once, until you have taught
        about all the ones in the list.`;
                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    'Teach me',
                    socket,
                    assistantInstruction,
                    'aiTutor'
                );
            });

            // learning objective message
            socket.on(
                'send-learning-objective-message',
                async (messageData) => {
                    const assistantInstruction =
                        `Please do not repeat the question. Please tutor about the topic: ` +
                        messageData.learningObjective +
                        '. Tutor the user as if they are at a ' +
                        messageData.skillLevel +
                        ' level and age. Ask follow up questions. Make sure to have $ delimiters before any science and math string that can convert to Latex`';
                    await createRunStream(
                        messageData.threadId,
                        messageData.assistantId,
                        messageData.message,
                        socket,
                        assistantInstruction,
                        'learningObjective'
                    );
                }
            );
        } catch (error) {
            socket.emit('error', error);
            console.error(error);
        }
    });
};

module.exports = { createSocket };
