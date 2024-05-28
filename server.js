const express = require('express');
const bodyParser = require("body-parser");
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const PORT = 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const server = createServer(app);
const io = new Server(server);

let room = 'room1';

app.get('/', (req, res) => {
  res.render("index", { title: "TTT-online" });
});

app.get('/game', (req, res) => {
  res.render("game", { title: "Playing" });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("join room", () => {
    socket.join(room);
    console.log('user joined room:', room);
    io.to(room).emit("hello");
  });

  socket.on('play move', (data) => {
    console.log('play move:', data);
    socket.broadcast.emit(`play move ${data.room}`, data);
  });

  socket.on('chat message out', (msg) => {
    socket.broadcast.emit('chat message in', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log('server running at http://localhost:' + PORT);
});
