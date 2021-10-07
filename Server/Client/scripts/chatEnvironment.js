const title = document.querySelector('h1');
const subtitle = document.querySelector('.RoomDescription');
const sideNote = document.querySelector('.Side');

var loadedData = sessionStorage.getItem('room');
if (loadedData != 'undefined') {
	var room = JSON.parse(loadedData);
	title.innerText = room.name;
	subtitle.innerText = room.description;
	sideNote.innerText = 'Password: ' + room.password;
}


function setSizeOfMessageBox(ele) {
	ele.height = window.innerHeight - 170;
}