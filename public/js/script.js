const socket = io();

let winner = null;
let endOfGame = false;

let room = new URLSearchParams(window.location.search).get("room");

document.addEventListener('DOMContentLoaded', () => {
  socket.emit("joining room", room);
  socket.on("room full", () => {
    window.location.replace("../haha");
  });
});

socket.emit("join room", room);
console.log("You are in room", room);

window.addEventListener("unload", function () {
  socket.emit("leave room", room);
});

document.querySelector(".waiting").innerHTML = "Waiting for opponent...";

// If the other player joins the room, start the game

socket.on(`game ready ${room}`, () => {
  console.log("Game ready");
  document.querySelector(".waiting").innerHTML = "";

  let myTurn = false;

  if (!endOfGame) {

    socket.on(`your turn ${room}`, () => {
      myTurn = true;
      document.querySelector(".myTurn").innerHTML = "It's your turn!";
      document.querySelector(".opponentTurn").innerHTML = "";
      console.log("It's your turn");
    });

    socket.on(`not your turn ${room}`, () => {
      myTurn = false;
      document.querySelector(".myTurn").innerHTML = "";
      document.querySelector(".opponentTurn").innerHTML = "It's your opponent's turn!";
      console.log("It's not your turn");
    });

  } else {
    document.querySelector(".myTurn").style.visibility = "hidden";
    document.querySelector(".opponentTurn").style.visibility = "hidden";
  }

  socket.on(`opponent left ${room}`, () => {
    document.querySelector(".loser").innerHTML = "Your opponent left the game!";
    document.querySelector(".myTurn").innerHTML = "";
    document.querySelector(".opponentTurn").innerHTML = "";
    document.getElementById("chatButton").style.visibility = "hidden";
    gameEnd();
  });

  ///////////////////////////////////////////////////
  ////////////////// CHAT LOGIC //////////////////////
  ///////////////////////////////////////////////////

  document.getElementById("chatButton").style.visibility = "visible";

  let messages = document.getElementById("messages");
  let form = document.getElementById("form");
  let input = document.getElementById("input");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value) {
      let item = document.createElement("p");
      let chatboxScroll = document.querySelector(".scroll");
      const msg = input.value;
      socket.emit("chat message out", { msg, room });
      item.classList.add("msg", "has-background-info", "is-size-6", "outgoing-message");
      item.textContent = input.value;
      messages.appendChild(item);
      chatboxScroll.scrollTop = chatboxScroll.scrollHeight;
      input.value = "";
    }
  });

  socket.on(`chat message in ${room}`, (msg) => {
    console.log("message received", msg);
    let item = document.createElement("p");
    let chatboxScroll = document.querySelector(".scroll");
    item.classList.add("msg", "has-background-danger", "is-size-6", "incoming-message");
    item.textContent = msg;
    messages.appendChild(item);
    chatboxScroll.scrollTop = chatboxScroll.scrollHeight;
  });

  ///////////////////////////////////////////////////
  ////////////////// CHAT TOGGLE ////////////////////
  ///////////////////////////////////////////////////

  toggleButton = document.querySelector(".chatToggleButton");
  let chatToggled = false;

  toggleButton.addEventListener("click", function () {
    chatbox = document.querySelector(".chatbox");
    switch (chatToggled) {
      case true:
        chatbox.style.visibility = "hidden";
        chatToggled = !chatToggled;
        break;
      case false:
        chatbox.style.visibility = "visible";
        chatToggled = !chatToggled;
        break;
    }
  });

  ///////////////////////////////////////////////////
  ////////////////// GAME LOGIC /////////////////////
  ///////////////////////////////////////////////////

  // Draw the playfield

  function fillPlayfield() {
    let playfield = document.querySelector(".playfield");

    for (let i = 0; i < 3; i++) {
      let row = document.createElement("div");
      row.classList.add("row");
      row.dataset.row = i;
      for (let j = 0; j < 3; j++) {
        let cell = document.createElement("div");
        cell.classList.add("cell", "has-background-black-ter", "has-text-white");
        cell.innerHTML = "";
        cell.dataset.column = j;
        row.appendChild(cell);
      }
      playfield.appendChild(row);
    }
  }
  fillPlayfield();

  // Handle the game end

  function gameEnd() {
    endOfGame = true;
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.style.visibility = "hidden";
    });
    document.querySelector(".redirecting").innerHTML = "Redirecting you to the main page...";
    document.querySelector(".myTurn").style.visibility = "hidden";
    document.querySelector(".opponentTurn").style.visibility = "hidden";
    setTimeout(() => {
      window.location.replace("../");
    }, 3000);
  }

  // Check for winner

  checkWinner = () => {
    const cells = document.querySelectorAll("div.cell");
    const winningCombos = [
      // row
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // col
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // diagonal
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < winningCombos.length; i++) {
      let [a, b, c] = winningCombos[i];
      if (
        cells[a].textContent === "X" &&
        cells[b].textContent === "X" &&
        cells[c].textContent === "X"
      ) {
        if (!endOfGame) {
          endOfGame = true;
          document.querySelector(".winner").innerHTML = "You won!";
          gameEnd();
          break;
        }
      } else if (
        cells[a].textContent === "O" &&
        cells[b].textContent === "O" &&
        cells[c].textContent === "O"
      ) {
        if (!endOfGame) {
          endOfGame = true;
          document.querySelector(".loser").innerHTML = "You lost!";
          gameEnd();
          break;
        }
      } else if (
        (cells[0].textContent === "X" || cells[0].textContent === "O") &&
        (cells[1].textContent === "X" || cells[1].textContent === "O") &&
        (cells[2].textContent === "X" || cells[2].textContent === "O") &&
        (cells[3].textContent === "X" || cells[3].textContent === "O") &&
        (cells[4].textContent === "X" || cells[4].textContent === "O") &&
        (cells[5].textContent === "X" || cells[5].textContent === "O") &&
        (cells[6].textContent === "X" || cells[6].textContent === "O") &&
        (cells[7].textContent === "X" || cells[7].textContent === "O") &&
        (cells[8].textContent === "X" || cells[8].textContent === "O")
      ) {
        if (!endOfGame) {
          endOfGame = true;
          document.querySelector(".draw").innerHTML = "It's a tie!";
          gameEnd();
          break;
        }
      }
    }
  };

  // Draw an X for local player

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("click", function () {
      if (this.innerHTML === "" && myTurn) {
        const row = parseInt(this.parentElement.dataset.row);
        const column = parseInt(this.dataset.column);
        this.innerHTML = '<p class="cell">' + "X" + "</p>";
        socket.emit("play move", { row, column, room });
        myTurn = false; 
      }
      checkWinner();
    });
  });

  // Get the move from the other player and draw an O

  socket.on(`play move ${room}`, (data) => {
    const { row, column, room } = data;
    const cell = document.querySelector(
      `.row[data-row='${row}'] .cell[data-column='${column}']`
    );
    cell.innerHTML = '<p class="cell">' + "O" + "</p>";
    checkWinner();
  });
});
