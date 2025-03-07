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
        console.log('a user connected with socket info: ');
        console.log(socket.id)
        // create a new run if a socket is connect

        socket.on('send-message', (text, callback) => {
            console.log('user said: ')
            console.log(text)
            callback('Sever heard you loud and clear: ' + socket.client)
        })
        socket.on('create-stream', async (userId, skillId, skillName, skillLevel, skillUrl, callback) => {
            try {
                const assistantData = await getAssistantData(userId, skillId, skillName, skillLevel, skillUrl);
                await createRunStream(assistantData.threadId, assistantData.assistantId);
                callback('create run successfully');
            } catch (error) {
                console.error(error)
            }
        })
    });
}



module.exports = { createSocket }
