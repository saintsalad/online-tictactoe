import express from 'express';
import { Server } from 'socket.io';
import { createServer } from "http";
import path from 'path';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    }, allowEIO3: true
});

const __dirname = path.resolve();
app.use(cors());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

app.get('/', (req, res) => {
    res.render('Main',
        {
            port: PORT,
            rooms: getActiveRooms(io)
        });
});


// SOCKET IOs
let ROOMS = [];

io.on('connection', (socket) => {
    ROOMS = getActiveRooms(io);
    // console.log('connected :', socket.id);

    socket.emit('update', {
        rooms: getActiveRooms(io)
    });

    socket.on('disconnect', (reason) => {
        console.log(socket.id, reason)
    });

    socket.on('move', (data) => {
        io.to(data.room).emit('move', {
            moves: data.moves,
            turn: data.turn
        });
    });

    socket.on('game-result', (data) => {
        io.to(data.room).emit('game-result', {
            result: data.result
        });
    })

    socket.on('join-room', (data) => {

        getAvailableRoom(io).then(r => {
            if (r) {
                socket.join(r);
                socket.emit('joined-room', {
                    room: r,
                    isHost: false,
                    isReady: true
                });
                socket.to(r).emit('game-ready', {
                    isReady: true
                });
            } else {
                let autoroom = uuidv4();
                socket.join(autoroom);
                socket.emit('joined-room', {
                    room: autoroom,
                    isHost: true,
                    isReady: false
                });
            }

        });
    });

    io.of("/").adapter.on("join-room", (room, id) => {
        if (getActiveRooms(io).length >= 1) {
            console.log(`socket ${id} has joined ${room}`);
        }
    });

    io.of("/").adapter.on("leave-room", (room, id) => {
        console.log(`socket ${id} has leave ${room}`);
    });
});

function getActiveRooms(io) {
    // Convert map into 2D list:
    // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
    const arr = Array.from(io.sockets.adapter.rooms);
    // Filter rooms whose name exist in set:
    // ==> [['room1', Set(2)], ['room2', Set(2)]]
    const filtered = arr.filter(room => !room[1].has(room[0]))
    // Return only the room name: 
    // ==> ['room1', 'room2']
    const res = filtered.map(i => i[0]);
    return res;
}

const getAvailableRoom = async (io) => {
    const rooms = getActiveRooms(io);
    for (let room of rooms) {
        let c = await io.in(room).fetchSockets();
        let filtered = c.map(function (item) { return item.id; });
        if (filtered.length === 1) {
            return room;
        } else {
            console.log('no room available')
        }
    }
}

const getRoomClients = async (io, room) => {
    const c = await io.in(room).fetchSockets();
    const filtered = c.map(function (item) { return item.id; });
    return filtered;
}

