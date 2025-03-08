import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
    connected: false,
    assistantData: [],
    testVar: 'ha ha'
});

// "undefined" means the URL will be computed from the `window.location` object ( This is pretty brilliant as we do not have )
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export const socket = io(URL);



socket.on("connect", () => {
    state.connected = true;
    console.log('Connect to Sever')
});

socket.on("disconnect", () => {
    state.connected = false;
    console.log('Disconnect From Sever');
});


socket.on('send-message', (...args) => {
    console.log('user send message')
    console.log(args)
})


socket.on('response-message', (...args) => {
    console.log(args[0]);
    state.testVar = args[0];
});

socket.on('assistant-data', (...args) => {
    console.log('assistant data: ')
    console.log(args[0])
    state.testVar = args[0];
})