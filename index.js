const express = require('express');
const bodyParser = require("body-parser");
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.render("index", { title: "TTT-online" });
});

app.get('/game', (req, res) => {
  res.render("game", { title: "Playing" });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('play move', (data) => {
    console.log('play move:', data);
    // Broadcast the move to all other clients except the sender
    socket.broadcast.emit('play move', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(25565, () => {
  console.log('server running at http://localhost:3000');
});
