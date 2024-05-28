// Redirect user to playing the game

function onlineJoin() {
  const inputRoom = document.getElementById("inputRoom");
  window.location.assign(`./game?room=${inputRoom.value}`);
}