import { reactive } from 'vue';
import { io } from 'socket.io-client';

export const socketState = reactive({
    connected: false,
    assistantData: [],
    streamingMessage: '',
    isStreaming: false,
    isRunJustEnded: false,
    isStudentMasteredSkill: false,
    streamType: 'aiTutor',
    // This store what stream is currently streaming and the front end can correctly showing
    currentStreamThread: '',
});

// "undefined" means the URL will be computed from the `window.location` object ( This is pretty brilliant as we do not have )
const URL =
    process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const socket = io(URL);

socket.on('connect', () => {
    socketState.connected = true;

});

socket.on('disconnect', () => {
    socketState.connected = false;

});

socket.on('stream-message', (...args) => {
    socketState.isRunJustEnded = false;
    socketState.isStreaming = true;
    // console.log('stream type')
    // console.log(args[1])
    socketState.streamingMessage = socketState.streamingMessage + args[0].value;
    socketState.streamType = args[1];
    socketState.currentStreamThread = args[3]
});

socket.on('run-end', (...args) => {
    socketState.isStreaming = false;
    socketState.isRunJustEnded = true;
});

socket.on('new-learning-objective-message', (...args) => {
    console.log('new message ')
    console.log(args[0])
    socketState.currentStreamThread = args[0].threadId
})

// socket.on('remove-stream-message', (...args) => {
//     socketState.streamingMessage = '';
// });

// socket.on('remove-message', () => {
//     socketState.streamingMessage = '';
// });

// socket.on('stream-assessment-message', (...args) => {
//     socketState.isRunJustEnded = false;
//     socketState.isStreaming = true;
//     socketState.streamingMessage = socketState.streamingMessage + args[0].value;
// });

// socket.on('assessment-run-end', (...args) => {
//     if (socketState.streamingMessage === 'yes') {
//         socketState.isStudentMasteredSkill = true;
//     }
//     socketState.isStreaming = false;
//     socketState.isRunJustEnded = true;
// });
