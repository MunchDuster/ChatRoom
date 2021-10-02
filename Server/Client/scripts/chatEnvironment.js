const title = document.querySelector('h1');
const subtitle = document.querySelector('.RoomDescription');
const sideNote = document.querySelector('.Side');

var room = JSON.parse(sessionStorage.getItem('room'));
if (room != null) {
	title.innerText = room.name;
	subtitle.innerText = room.description;
	sideNote.innerText = 'Password: ' + room.password;
}