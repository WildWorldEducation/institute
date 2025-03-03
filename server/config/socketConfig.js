const { Server } = require("socket.io");

let io = null

const createSocket = (server) => {
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected with socket info: ');
        console.log(socket.id)
        socket.on('send-message', (text, callback) => {
            console.log('user said: ')
            console.log(text)
            callback('Sever heard you loud and clear: ' + socket.client)
            socket.emit('response-message', 'Can use heard me client: ')

        })
    });
}

module.exports = { createSocket }
