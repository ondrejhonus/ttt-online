const socket = io();
let winner = null;
let endOfGame = false;

///////////////////////////////////////////////////
////////////////// CHAT LOGIC //////////////////////
///////////////////////////////////////////////////

let messages = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    let item = document.createElement("p");
    let chatboxScroll = document.querySelector(".scroll");
    socket.emit("chat message out", input.value);
    item.classList.add("msg", "has-background-info", "is-size-6", "outgoing-message");
    item.textContent = input.value;
    messages.appendChild(item);
    chatboxScroll.scrollTop = chatboxScroll.scrollHeight;
    input.value = "";
  }
});

socket.on("chat message in", function (msg) {
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
////////////////// GAME LOGIC //////////////////////
///////////////////////////////////////////////////


// Redirect user to playing the game

function onlineJoin() {
  window.location.replace("./game");
}

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
      document.querySelector(".winner").innerHTML = "You won!";
      endOfGame = true;
      break;
    }
    else if (
      cells[a].textContent === "O" &&
      cells[b].textContent === "O" &&
      cells[c].textContent === "O"
    ) {
      document.querySelector(".loser").innerHTML = "You lost!";
      endOfGame = true;
      break;
    }
    else if (
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
      document.querySelector(".draw").innerHTML = "It's a tie!";
      endOfGame = true;
    }
  }
  if (endOfGame) {
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.style.visibility = "hidden";
    });
    setTimeout(() => {
      window.location.replace("../");
    }, 3000);
  }
};

// Draw an X for local player

document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", function () {
    if (this.innerHTML === "") {
      const row = parseInt(this.parentElement.dataset.row);
      const column = parseInt(this.dataset.column);
      this.innerHTML = '<p class="cell">' + "X" + "</p>";
      socket.emit("play move", { row, column });
    }
    checkWinner();
  });
});

// Get the move from the other player and draw an O

socket.on("play move", (data) => {
  const { row, column } = data;
  const cell = document.querySelector(
    `.row[data-row='${row}'] .cell[data-column='${column}']`
  );
  cell.innerHTML = '<p class="cell">' + "O" + "</p>";
  checkWinner();
});
