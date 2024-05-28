const socket = io();

  function onlineJoin() {
    const inputRoom = document.getElementById("inputRoom");
    const room = inputRoom.value;
    let roomFull = false;

    socket.emit("ask full", room);

    socket.on("room joined", (room) => {
      if (!roomFull) {
        window.location.assign(`./game?room=${room}`);
      }
    });

    socket.on("room full", (room) => {
      roomFull = true;
      alert(`Room ${room} is full`);
    });
  }