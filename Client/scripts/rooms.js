//Make and join room window stuff
const recentRoomsDiv = document.querySelector('.Recent');
const myRoomsDiv = document.querySelector('.MyRooms');

const roomMakeNameInput = document.getElementById('roomMakeName');
const roomMakeDescriptionInput = document.getElementById('roomMakeDesc');
const roomMakePasswordInput = document.getElementById('roomMakePass');

const roomJoinNameInput = document.getElementById('roomName');
const roomJoinPasswordInput = document.getElementById('roomPass');

var quickJoinRoomName;
//GET USER FROM SESSION_STORAGE
var user = sessionStorage.getItem('user');
if (user != 'undefined') {
	user = JSON.parse(user);

	//show recent rooms
	for (var i = 0; i < user.recentRooms.length; i++) {
		var room = user.recentRooms[i];
		displayRoom(recentRoomsDiv, room, quickJoinRoom);
	}

	//show my rooms
	for (var i = 0; i < user.myRooms.length; i++) {
		var room = user.myRooms[i];
		displayRoom(myRoomsDiv, room, quickJoinRoom);
	}
}


function OnMakeRoomResult({ success, info }) {
	if (success) {
		console.log('Make room success');
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
		console.log('Make room failure: ' + info);
		alert(info);
	}
}
function OnJoinRoomResult({ success, info }) {
	if (success) {
		console.log('Join room success');
		//save to sessionStorage
		var room = Object.assign({
			name: roomJoinNameInput.value,
			password: roomJoinPasswordInput.value,
		}, info);
		sessionStorage.setItem('room', JSON.stringify(room));

		//load 
		window.location.href = '/chat.html';
	} else {
		console.log('Join room failure: ' + info);
		alert(info);
	}
}
function OnQuickJoinRoomResult({ success, info }) {
	if (success) {
		//save to sessionStorage
		var data = Object.assign({
			name: quickJoinRoomName
		}, info);
		sessionStorage.setItem('room', JSON.stringify(data));

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



function makeRoom() {
	// socket.emit('make room attempt', roomMakeNameInput.value, roomMakePassinput.value, roomMakeDescinput.value);
	const data = {
		roomname: roomMakeNameInput.value,
		roompass: roomMakePasswordInput.value,
		roomdesc: roomMakeDescriptionInput.value,
		username: user.name,
		userpass: user.password
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
	// socket.emit('join room attempt', roomJoinNameInput.value, roomJoinPasswordInput.value);
	const data = {
		roomname: roomJoinNameInput.value,
		roompass: roomJoinPasswordInput.value,
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
		roomname: room.name,
	};
	quickJoinRoomName = room.name;
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

