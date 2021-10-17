const title = document.querySelector('h1');
const subtitle = document.querySelector('.RoomDescription');
const sideNote = document.querySelector('.Side');

function setSizeOfMessageBox(ele) {
	ele.height = window.innerHeight - 170;
}

events.addListener('OnJoinRoom', () => {
	//display the room title
	title.innerText = room.name;

	//display the room description
	subtitle.innerText = room.description;

	//display the room password
	sideNote.innerText = 'Password: ';
	var passwordDiv = document.createElement('div');
	passwordDiv.className = 'SideChild';
	passwordDiv.innerText = room.password;
	sideNote.appendChild(passwordDiv);
});