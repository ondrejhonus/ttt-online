const socket = io();
let xo = "X";
let winner = null;

function fillPlayfield() {
  let playfield = document.querySelector(".playfield");

  for (let i = 0; i < 3; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    row.dataset.row = i;

    for (let j = 0; j < 3; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.innerHTML = "";
      cell.dataset.column = j;
      row.appendChild(cell);
    }
    playfield.appendChild(row);
  }
}
fillPlayfield();

checkWinner = () => {
  const cells = document.querySelectorAll(".cell");
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
      return;
    }
    if (
      cells[a].textContent === "O" &&
      cells[b].textContent === "O" &&
      cells[c].textContent === "O"
    ) {
      document.querySelector(".winner").innerHTML = "You lost!";
      return;
    }
  }
};

document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", function () {
    if (this.innerHTML === "") {
      const row = parseInt(this.parentElement.dataset.row);
      const column = parseInt(this.dataset.column);
      this.innerHTML = '<p class="cell">' + "X" + "</p>";
      xo = xo === "X" ? "O" : "X";
      socket.emit("play move", { row, column, xo });
    }
  checkWinner();

  });
});

socket.on("play move", (data) => {
  const { row, column, xo } = data;
  const cell = document.querySelector(
    `.row[data-row='${row}'] .cell[data-column='${column}']`
  );
  cell.innerHTML = '<p class="cell">' + "O" + "</p>";
  checkWinner();
});
checkWinner();

