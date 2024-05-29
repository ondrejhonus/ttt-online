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

let roomPlayers = {};

app.get('/', (req, res) => {
  res.render("menu");
});

app.get('/game', (req, res) => {
  res.render("game");
});

app.get('/haha', (req, res) => {
  res.render("haha");
});

io.on('connection', (socket) => {
  socket.on("joining room", (room) => {
    let playersInRoom = roomPlayers[room] || 0;
    if (playersInRoom < 1) {
      roomPlayers[room] = playersInRoom + 1;
      console.log(`There are ${roomPlayers[room]} players in room ${room}`);
      console.log('user joined room:', room);
    }

    else if (playersInRoom < 2) {
      roomPlayers[room] = playersInRoom + 1;
      console.log(`There are ${roomPlayers[room]} players in room ${room}`);
      console.log('user joined room:', room);
      setTimeout(() => {
        socket.emit(`game ready ${room}`);
        socket.broadcast.emit(`game ready ${room}`);
      }, 1000);
    }

    else {
      socket.emit("room full", room);
    }
  });

  socket.on("ask full", (room) => {
    if (roomPlayers[room] == 2) {
      socket.emit("room full", room);
    }
    else {
      socket.emit("room joined", room);
    }
  });

  socket.on("join room", (room) => {
    socket.join(room);
  });

  socket.on('play move', (data) => {
    console.log('play move:', data);
    socket.to(data.room).emit(`play move ${data.room}`, data);
  });

  socket.on('chat message out', (data) => {
    socket.to(data.room).emit(`chat message in ${data.room}`, data.msg);
  });

  socket.on("leave room", (room) => {
    console.log("user left room", room);

    if (roomPlayers[room]) {
      roomPlayers[room]--;
      if (roomPlayers[room] === 0) {
        delete roomPlayers[room];
      }
    }

    socket.leave(room);
  });

  socket.on('disconnect', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        if (roomPlayers[room]) {
          roomPlayers[room]--;
          if (roomPlayers[room] === 0) {
            delete roomPlayers[room];
          }
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log('server running at http://localhost:' + PORT);
});
