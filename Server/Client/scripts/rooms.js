var socket;

const recentRoomsDiv = document.querySelector('.Recent');
const myRoomsDiv = document.querySelector('.MyRooms');

function setSocket(sock, user, room) {
	if (user == null) {
		alert("refresh the page and sign in please.");
		return;
	}
	socket = sock;
	socket.emit('request rooms');
	socket.on('request rooms result', OnRoomsResult)
	socket.on('make room result', OnMakeRoomResult);
	socket.on('join room result', OnJoinRoomResult);
	socket.on('quick join room result', OnQuickJoinRoomResult);

	function OnMakeRoomResult(success) {
		console.log('server responded to make room ')
		if (success) {
			getRoom(roomMakeNameInput.value, roomMakeDescinput.value, roomMakePassinput.value);
			loadPage('chat.html');
		} else {
			alert('room with name already exists.');
		}
	}
	function OnJoinRoomResult(success, msg) {
		console.log('server responded to join room ')
		if (success) {
			getRoom(roomJoinNameInput.value, msg, roomJoinDescinput.value);
			loadPage('chat.html');
		} else {
			alert(msg);
		}
	}
	function OnQuickJoinRoomResult(success, name, desc, pass) {
		console.log('recived: ' + name + ', ' + desc + ', ' + pass);
		if (success) {
			getRoom(name, desc, pass);
			loadPage('chat.html');
		} else {
			alert(name); //name is msg if error
		}
	}
	function OnRoomsResult(recentRooms, myRooms) {
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
}

//Make and join room window stuff
const roomMakeNameInput = document.getElementById('roomMakeName');
const roomMakeDescinput = document.getElementById('roomMakeDesc');
const roomMakePassinput = document.getElementById('roomMakePass');

const roomJoinNameInput = document.getElementById('roomName');
const roomJoinDescinput = document.getElementById('roomPass');

function makeRoom() {
	socket.emit('make room attempt', roomMakeNameInput.value, roomMakePassinput.value, roomMakeDescinput.value);
}
function joinRoom() {
	console.log('join room appempt' + roomJoinNameInput.value + ", " + roomJoinDescinput.value);
	socket.emit('join room attempt', roomJoinNameInput.value, roomJoinDescinput.value);
}
function quickJoinRoom(room) {
	socket.emit('quick join room attempt', room._id);
}

const makeRoomWindow = document.querySelector('.MakeRoom');
const joinRoomWindow = document.querySelector('.JoinRoom');;
function openMakeRoomWindow() {
	openWindow(makeRoomWindow);
}
function openJoinRoomWindow() {
	openWindow(joinRoomWindow);
}