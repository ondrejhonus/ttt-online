const socket = io();
let xo = "X"; // Define and initialize xo variable

function fillPlayfield() {
  let playfield = document.querySelector(".playfield");

  for (let i = 0; i < 3; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    row.dataset.row = i;

    for (let j = 0; j < 3; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.column = j;
      row.appendChild(cell);
    }

    playfield.appendChild(row);
  }
}
fillPlayfield();

// Event listener for cell clicks
document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', function () {
    if (this.innerHTML === "") {
      const row = parseInt(this.parentElement.dataset.row);
      const column = parseInt(this.dataset.column);
      this.innerHTML = '<p class="cell">' + xo + "</p>";
      socket.emit("play move", { row, column, xo });
      xo = xo === "X" ? "O" : "X";
    }
  });
});

// Listener for opponent's move
socket.on("play move", (data) => {
  const { row, column, xo } = data;
  const cell = document.querySelector(`.row[data-row='${row}'] .cell[data-column='${column}']`);
  cell.innerHTML = '<p class="cell">' + xo + "</p>";
});


