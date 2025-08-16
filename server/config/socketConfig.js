const { Server } = require('socket.io');
const { createRunStream } = require('../utilities/openAIAssistant');
const { checkIfSkillNeedFileSearch } = require('../utilities/openAIAssistant');

let io = null;

const createSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        try {
            // user send normal message event
            socket.on('new-message', async (messageData, callback) => {
                // This has to do with when the user presses "send" with no message.
                const isEmptyMessage = false;

                // Check if this skill uses file search
                const isFileSearchSkill = checkIfSkillNeedFileSearch(
                    messageData.skillName
                );

                // Document usage guidelines for file search skills
                const documentUsageGuidelines = isFileSearchSkill
                    ? `
                
                5. CRITICAL DOCUMENT USAGE RULES - FOLLOW STRICTLY:
                   - NEVER mention "uploaded files", "documents", "materials", "files", or "uploaded" in any context
                   - NEVER reference document uploads, file searches, or external sources
                   - Present ALL information as your natural knowledge of the subject
                   - Use reference materials seamlessly without any acknowledgment of their existence
                   - If you have specialized knowledge, present it as if it's part of your training
                   - FORBIDDEN PHRASES: "uploaded", "document", "file", "material", "based on the", "according to"
                   - Act as if you are an expert who naturally knows this information`
                    : '';

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
                        
                        4. IMPORTANT: Ask ONLY ONE QUESTION per message. Never ask multiple questions in the same message.
                           Even if covering multiple related concepts, focus on one clear question at a time.
                        ${documentUsageGuidelines}

                        Make sure to have $ delimiters before any science and math strings that can convert to Latex
                        Please keep all messages below 1000 characters, and succinct.`;
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
                   - ONLY ASK ONE QUESTION AT A TIME - this is absolutely critical
                   - Never combine multiple questions in a single message
                   - Prioritize asking questions on learning objectives that the student does not seem to know well

                3. Feedback Principles:
                   - Be specific about what is correct or incorrect
                   - Use language appropriate for a ${messageData.skillLevel} level student
                   - Aim to guide the student towards a more comprehensive understanding
                ${documentUsageGuidelines}

                Make sure to have $ delimiters before any science and math strings that can convert to Latex.
                Please keep all messages below 1000 characters.`;
                }

                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    messageData.message,
                    isEmptyMessage,
                    socket,
                    instructions,
                    'aiTutor',
                    messageData.userId,
                    messageData.skillId,
                    messageData.freeMonthlyTokenLimit,
                    messageData.monthlyTokenUsage
                );
            });

            // user send test me message event
            socket.on('ask-question', async (messageData, callback) => {
                // This has to do with when the user presses "send" with no message.
                const isEmptyMessage = true;

                // Check if this skill uses file search
                const isFileSearchSkill = checkIfSkillNeedFileSearch(
                    messageData.skillName
                );

                // Document usage guidelines for file search skills
                const documentUsageGuidelines = isFileSearchSkill
                    ? `
                
                CRITICAL DOCUMENT USAGE RULES - FOLLOW STRICTLY:
                - NEVER mention "uploaded files", "documents", "materials", "files", or "uploaded" in any context
                - NEVER reference document uploads, file searches, or external sources
                - Present ALL information as your natural knowledge of the subject
                - Use reference materials seamlessly without any acknowledgment of their existence
                - If you have specialized knowledge, present it as if it's part of your training
                - FORBIDDEN PHRASES: "uploaded", "document", "file", "material", "based on the", "according to"
                - Act as if you are an expert who naturally knows this information`
                    : '';

                // Assistant instructions
                let instructions = '';
                if (messageData.tutorType == 'socratic') {
                    instructions = `
                    The user is at a ${messageData.skillLevel} level and age.
                    Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.                    

                    Strategy:
                     - Use the Socratic method of teaching
                     - Ask questions on the content
                     - ALWAYS ASK ONLY ONE QUESTION AT A TIME
                     - Never combine multiple questions in a single message, even if they are related
                     - If needed, ask a follow-up question to help the student understand better after they respond
                     - If the answer shows partial understanding, guide the student towards a more complete understanding
                     - Prioritize asking questions on learning objectives that the student does not seem to know well
                     - Aim to guide the student towards a more comprehensive understanding
                    ${documentUsageGuidelines}
                                        
                    Make sure to have $ delimiters before any science and math strings that can convert to Latex
                    `;
                } else {
                    instructions = `The user is at a ${messageData.skillLevel} level and age.
                    Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
                                   
                    Strategy:
                     - Ask questions about each learning objective, one after the other
                     - When you get to the end of the array, start again
                     - ALWAYS ASK ONLY ONE QUESTION PER MESSAGE
                     - Make your question clear, focused, and specific
                     - Never combine multiple questions in a single message
                     - Prioritize asking questions on learning objectives that the student does not seem to know well
                    ${documentUsageGuidelines}
                              
                    Make sure to have $ delimiters before any science and math strings that can convert to Latex.
                    Please keep all messages below 1000 characters.`;
                }

                await createRunStream(
                    messageData.threadId,
                    messageData.assistantId,
                    messageData.message,
                    isEmptyMessage,
                    socket,
                    instructions,
                    'aiTutor',
                    messageData.userId,
                    messageData.skillId,
                    messageData.freeMonthlyTokenLimit,
                    messageData.monthlyTokenUsage
                );
            });

            // learning objective message
            socket.on('new-learning-objective-message', async (messageData) => {
                // This has to do with when the user presses "send" with no message.
                const isEmptyMessage = false;

                // Check if this skill uses file search (need to get skill name from learning objective)
                // For now, assume it could use file search and include guidelines
                const documentUsageGuidelines = `
                
                DOCUMENT USAGE:
                - If you have access to reference materials, use them naturally without mentioning "uploaded files" or "documents"
                - Present information as your knowledge of the subject
                - Do not reference that files have been uploaded or that you're accessing external documents
                - Never mention "uploaded files", "documents", or similar terms to the student`;

                const assistantInstruction = (instructions = `
                    The user is at a ${messageData.skillLevel} level and age.
                    Please review the chat history and the following learning objective: ${messageData.learningObjective}.                    

                    Strategy:
                     - Use the Socratic method of teaching
                     - Ask questions on the content
                     - ALWAYS ASK ONLY ONE QUESTION PER MESSAGE
                     - Never combine multiple questions, even if they are closely related
                     - If needed, ask a follow-up question to help the student understand better
                     - If the answer shows partial understanding, guide the student towards a more complete understanding
                     - Prioritize asking questions on learning objectives that the student does not seem to know well
                     - Aim to guide the student towards a more comprehensive understanding
                    ${documentUsageGuidelines}
                                        
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
                    messageData.userId,
                    messageData.skillId,
                    messageData.freeMonthlyTokenLimit,
                    messageData.monthlyTokenUsage
                );
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        } catch (error) {
            socket.emit('error', error);
            console.error(error);
        }
    });
};

module.exports = { createSocket };
