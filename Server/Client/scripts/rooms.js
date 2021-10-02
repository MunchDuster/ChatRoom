const recentRoomsDiv = document.querySelector('.Recent');
const myRoomsDiv = document.querySelector('.MyRooms');


function OnMakeRoomResult({ success, err }) {
	console.log('server responded to make room ')
	if (success) {
		//save to sessionStorage
		var roomInfo = {
			name: roomMakeNameInput.value,
			password: roomMakePasswordInput.value,
			description: roomMakeDescriptionInput.value
		};
		sessionStorage.setItem('room', JSON.stringify(roomInfo));

		//load 
		window.location.href = '/chat.html';
	} else {
		alert(err);
	}
}
function OnJoinRoomResult({ success, info }) {
	console.log('server responded to join room ')
	if (success) {
		//save to sessionStorage
		sessionStorage.setItem('room', JSON.stringify(info));

		//load 
		window.location.href = '/chat.html';
	} else {
		alert(info);
	}
}
function OnQuickJoinRoomResult({ success, info }) {
	if (success) {
		//save to sessionStorage
		sessionStorage.setItem('room', JSON.stringify(info));

		//load 
		window.location.href = '/chat.html';
	} else {
		alert(info); //name is msg if error
	}
}
function OnRoomsResult({ recentRooms, myRooms }) {
	console.log('recent rooms: ' + recentRooms.length + ', my rooms: ' + myRooms.length);
	for (var i = 0; i < recentRooms.length; i++) {
		const room = recentRooms[i];
		const onClick = function () {
			socket.emit('quick join room attempt', room.name);
		};
		//displayRoom(parentTo, roomName, roomDescription, roomLastAccessed)
		displayRoom(recentRoomsDiv, room.name, room.description, room.lastAccessed, onClick);
	}
	for (var i = 0; i < myRooms.length; i++) {
		const room = myRooms[i];
		const onClick = function () {
			socket.emit('quick join room attempt', room.name);
		};
		//displayRoom(parentTo, roomName, roomDescription, roomLastAccessed)
		displayRoom(myRoomsDiv, room.name, room.description, room.ownerLastAccessed, onClick);
	}
}


//Make and join room window stuff
const roomMakeNameInput = document.getElementById('roomMakeName');
const roomMakeDescinput = document.getElementById('roomMakeDesc');
const roomMakePassinput = document.getElementById('roomMakePass');

const roomJoinNameInput = document.getElementById('roomName');
const roomJoinPassInput = document.getElementById('roomPass');

function makeRoom() {
	// socket.emit('make room attempt', roomMakeNameInput.value, roomMakePassinput.value, roomMakeDescinput.value);
	const data = {
		roomname: roomMakeNameInput.value,
		roompass: roomMakePassinput.value,
		roomdesc: roomMakeDescinput.value
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	fetch('/newroom', options)
		.then(response => response.json())
		.then(OnMakeRoomResult)
		.catch(err => console.error(`Login error: ${err}`));

}
function joinRoom() {
	// socket.emit('join room attempt', roomJoinNameInput.value, roomJoinPassInput.value);
	const data = {
		roomname: roomJoinNameInput.value,
		roompass: roomJoinPassInput.value,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	fetch('/joinroom', options)
		.then(response => response.json())
		.then(OnJoinRoomResult)
		.catch(err => console.error(`Login error: ${err}`));
}
function quickJoinRoom(room) {
	//socket.emit('quick join room attempt', room._id);
	const data = {
		roomname: roomJoinNameInput.value,
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	fetch('/quickjoinroom', options)
		.then(response => response.json())
		.then(OnQuickJoinRoomResult)
		.catch(err => console.error(`Login error: ${err}`));

}

const makeRoomWindow = document.querySelector('.MakeRoom');
const joinRoomWindow = document.querySelector('.JoinRoom');

function openMakeRoomWindow() {
	openWindow(makeRoomWindow);
}
function openJoinRoomWindow() {
	openWindow(joinRoomWindow);
}