const makeRoomWindow = document.querySelector('.MakeRoom');
const joinRoomWindow = document.querySelector('.JoinRoom');

const makeButton = document.querySelector('.Make');
makeButton.addEventListener('click', () => { openWindow(makeRoomWindow) });
const joinButton = document.querySelector('.Join');
joinButton.addEventListener('click', () => { openWindow(joinRoomWindow) });