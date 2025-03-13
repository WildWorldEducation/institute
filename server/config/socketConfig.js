const { Server } = require("socket.io");
const { getSkillThread, createRunStream, createAssistantAndThread, saveAITutorSkillThread, createAssessmentStream } = require("../utilities/openAIAssistant");



let io = null

const getAssistantData = async (userId, skillId, skillName, skillLevel, skillUrl) => {
    const assistantData = await getSkillThread(
        skillId,
        userId,
        skillUrl
    );
    if (assistantData.length === 0) {
        const newAssistant = await createAssistantAndThread(
            skillName,
            skillLevel
        );
        const newAssistantData =
        {
            userId: userId,
            skillUrl: skillUrl,
            assistantId: newAssistant.assistant.id,
            threadId: newAssistant.thread.id
        }
        await saveAITutorSkillThread(newAssistantData);
        return newAssistantData;
    } else {
        return {
            assistantId: assistantData[0].assistant_id,
            threadId: assistantData[0].thread_id,
        }
    }
}

const createSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        try {
            // user send normal message event
            socket.on('send-message', async (clientData, callback) => {
                await createRunStream(clientData.threadId, clientData.assistantId, clientData.message, socket);
            })

            // user send teach me message event
            socket.on('teach-request', async (messageData, callback) => {
                const assistantInstruction = `The user is at a ${messageData.skillLevel} level and age.
        Teach them about one of the following learning objectives: ${messageData.learningObjectives}.
        Do not ask teach about the same learning objective more than once, until you have taught
        about all the ones in the list.`;
                await createRunStream(messageData.threadId, messageData.assistantId, 'Teach me', socket, assistantInstruction);
            });

            // user send test me message event
            socket.on('ask-question-request', async (messageData, callback) => {
                const assistantInstruction = `The user is at a ${messageData.skillLevel} level and age.
        Please review the chat history and the following learning objectives: ${messageData.learningObjectives}.
        
        If the student has already shown understanding of a learning objective, do not ask a question about it.
        If the student has not yet shown understanding of a learning objective, do ask a question about it.
        Once the student has shown an understanding of all the learning objectives, let them know they have mastered
        the subject, and stop asking questions.`;
                await createRunStream(messageData.threadId, messageData.assistantId, 'Test me', socket, assistantInstruction);
            });

            // user send "Have I master this skill" event
            socket.on('assessment-request', async (messageData) => {
                const assistantInstruction = `The user is at a ${messageData.skillLevel} level and age.
        Review this chat stream and determine if they have understood and mastered the 
        following learning objectives: ${messageData.learningObjectives}.
        
        If they have, return only the word "yes" and no other words.
        If not, or if it is unclear, let them know that they need to answer more questions correctly.`
                await createAssessmentStream(messageData.threadId, messageData.assistantId, 'Do you think I have mastered this topic?', socket, assistantInstruction)
            })

        } catch (error) {
            socket.emit('error', error)
            console.error(error)
        }
    });
}




module.exports = { createSocket }
