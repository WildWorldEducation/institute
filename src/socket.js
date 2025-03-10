import { reactive } from "vue";
import { io } from "socket.io-client";

export const socketState = reactive({
    connected: false,
    assistantData: [],
    testVar: 'ha ha',
    streamingMessage: '',
    isStreaming: false,
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


socket.on('send-message', (...args) => {
    console.log('user send message')
    console.log(args)
})


socket.on('response-message', (...args) => {
    console.log(args[0]);
    socketState.testVar = args[0];
});

socket.on('assistant-data', (...args) => {
    console.log('assistant data: ')
    console.log(args[0])
    socketState.testVar = args[0];
})

socket.on('stream-message', (...args) => {
    socketState.isStreaming = true;
    socketState.streamingMessage = socketState.streamingMessage + args[0].value;

})

socket.on('run-end', (...args) => {
    socketState.isStreaming = false;
    socketState.streamingMessage = ''
})

