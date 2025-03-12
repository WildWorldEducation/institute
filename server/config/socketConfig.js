const { Server } = require("socket.io");
const { getSkillThread, createRunStream, createAssistantAndThread, saveAITutorSkillThread } = require("../utilities/openAIAssistant");



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
        // create a new run if a socket is connect
        socket.on('send-message', async (clientData, callback) => {
            try {
                await createRunStream(clientData.threadId, clientData.assistantId, clientData.message, socket);
            } catch (error) {
                socket.emit('error', error)
                console.error(error)
            }
        })
    });
}



module.exports = { createSocket }
