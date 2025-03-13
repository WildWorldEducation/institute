import { reactive } from "vue";
import { io } from "socket.io-client";


export const socketState = reactive({
    connected: false,
    assistantData: [],
    streamingMessage: '',
    isStreaming: false,
    isRunJustEnded: false,
    isStudentMasteredSkill: false,


});

// "undefined" means the URL will be computed from the `window.location` object ( This is pretty brilliant as we do not have )
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export const socket = io(URL);



socket.on("connect", () => {
    socketState.connected = true;
    console.log('Connect to Sever')
});

socket.on("disconnect", () => {
    socketState.connected = false;
    console.log('Disconnect From Sever');
});


socket.on('stream-message', (...args) => {
    socketState.isRunJustEnded = false;
    socketState.isStreaming = true;
    socketState.streamingMessage = socketState.streamingMessage + args[0].value;

})

socket.on('run-end', (...args) => {
    socketState.isStreaming = false;
    socketState.isRunJustEnded = true;
})

socket.on('remove-stream-message', (...args) => {
    socketState.streamingMessage = '';
})

socket.on('stream-assessment-message', (...args) => {
    socketState.isRunJustEnded = false;
    socketState.isStreaming = true;
    socketState.streamingMessage = socketState.streamingMessage + args[0].value;
})

socket.on('assessment-run-end', (...args) => {
    if (socketState.streamingMessage === 'yes') {
        socketState.isStudentMasteredSkill = true;
    }
    socketState.isStreaming = false;
    socketState.isRunJustEnded = true;
})

