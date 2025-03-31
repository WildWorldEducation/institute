const { Server } = require('socket.io');
const { createRunStream } = require('../utilities/openAIAssistant');

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
                        Please keep all messages below 2000 characters, and succinct.`;
                } else if (messageData.tutorType == 'assessing') {
                    instructions = `The user is at a ${messageData.skillLevel} level and age.
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
                Please keep all messages below 2000 characters.`;
                }

                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    messageData.message,
                    isEmptyMessage,
                    socket,
                    instructions,
                    'aiTutor',
                    messageData.userId
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

                    Strategy:
                     - Use the Socratic method of teaching
                     - Ask questions on the content                     
                     - Only ask one question at a time
                     - If needed, ask a follow-up questions to help the student understand better
                     - If the answer shows partial understanding, guide the student towards a more complete understanding
                     - Prioritize asking questions on learning objectives that the student does not seem to know well
                     - Aim to guide the student towards a more comprehensive understanding
                                        
                    Make sure to have $ delimiters before any science and math strings that can convert to Latex
                    `;
                } else {
                    instructions = `The user is at a ${messageData.skillLevel} level and age.
                    Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
                                   
                    Strategy:
                     - Ask questions about each learning objective, one after the other
                     - When you get to the end of the array, start again
                     - Only ask one question at a time
                     - Prioritize asking questions on learning objectives that the student does not seem to know well
                              
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
                    'aiTutor',
                    messageData.userId
                );
            });

            // learning objective message
            socket.on('new-learning-objective-message', async (messageData) => {
                // This has to do with when the user presses "send" with no message.
                const isEmptyMessage = false;
                const assistantInstruction = (instructions = `
                    The user is at a ${messageData.skillLevel} level and age.
                    Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.                    

                    Strategy:
                     - Use the Socratic method of teaching
                     - Ask questions on the content                     
                     - Only ask one question at a time
                     - If needed, ask a follow-up questions to help the student understand better
                     - If the answer shows partial understanding, guide the student towards a more complete understanding
                     - Prioritize asking questions on learning objectives that the student does not seem to know well
                     - Aim to guide the student towards a more comprehensive understanding
                                        
                    Make sure to have $ delimiters before any science and math strings that can convert to Latex
                    `);

                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    messageData.message,
                    isEmptyMessage,
                    socket,
                    assistantInstruction,
                    'learningObjective',
                    messageData.userId
                );
            });
        } catch (error) {
            socket.emit('error', error);
            console.error(error);
        }
    });
};

module.exports = { createSocket };
