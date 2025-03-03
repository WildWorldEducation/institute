const { Server } = require("socket.io");

let io = null

const createSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected with socket info: ');
        console.log(socket.id)
        socket.on('send-message', (text) => {
            console.log('user said: ')
            console.log(text)
        })
    });
}



module.exports = { createSocket }
