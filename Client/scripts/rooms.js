//Make and join room window stuff
const recentRoomsDiv = document.querySelector('.Recent');
const myRoomsDiv = document.querySelector('.MyRooms');

const roomMakeNameInput = document.getElementById('roomMakeName');
const roomMakeDescriptionInput = document.getElementById('roomMakeDesc');
const roomMakePasswordInput = document.getElementById('roomMakePass');

const roomJoinNameInput = document.getElementById('roomName');
const roomJoinPasswordInput = document.getElementById('roomPass');



pageEvents.addListener('OnUserLogin', () => {
	//close the login
	document.querySelector('.Join').style.display = 'none';
	//open the signup page
	document.querySelector('.Rooms').style.display = 'block';
	//populate teh rooms list
	OnRoomsList(user.recentRooms, user.myRooms);
});
pageEvents.addListener('OnUserSignup', () => {
	//close the login
	document.querySelector('.Join').style.display = 'none';
	//open the signup page
	document.querySelector('.Rooms').style.display = 'block';
});


function OnRoomsList(recentRooms, myRooms) {
	console.log('recent rooms: ' + recentRooms.length + ', my rooms: ' + myRooms.length);
	for (var i = 0; i < recentRooms.length; i++) {
		const room = recentRooms[i];
		const onClick = function () {
			QuickJoinRoom(room.name);
		};
		displayRoom(recentRoomsDiv, room, onClick);
	}
	for (var i = 0; i < myRooms.length; i++) {
		console.log('room is ');

		const room = myRooms[i];
		const onClick = function () {
			QuickJoinRoom(room.name);
		};

		console.log(room);
		displayRoom(myRoomsDiv, room, onClick);
	}
}
function QuickJoinRoom(roomname) {
	socket.emit('quick join room', roomname);
	socket.on('quick join room', (success, info) => {
		if (success) {
			room = Object.assign({ name: roomname }, info);
			pageEvents.fireEvent('OnJoinRoom');
		} else {
			console.log('quick join error: ' + info);
		}
	});
}
function makeRoom() {
	socket.emit('make room', roomMakeNameInput.value, roomMakePasswordInput.value, roomMakeDescriptionInput.value);
	socket.on('make room', (success, info) => {
		if (success) {
			console.log('Make room success');
			//save to sessionStorage
			room = {
				name: roomMakeNameInput.value,
				password: roomMakePasswordInput.value,
				description: roomMakeDescriptionInput.value
			};

			pageEvents.fireEvent('OnJoinRoom');
		} else {
			console.log('Make room failure: ' + info);
			alert(info);
		}
		socket.off('make room');
	})
}
function joinRoom() {
	socket.emit('join room', roomJoinNameInput.value, roomJoinPasswordInput.value);
	socket.on('join room', (success, info) => {
		if (success) {
			console.log('Join room success');
			//save to sessionStorage
			room = Object.assign({
				name: roomJoinNameInput.value,
				password: roomJoinPasswordInput.value,
			}, info);
			pageEvents.fireEvent('OnJoinRoom');
		} else {
			console.log('Join room failure: ' + info);
			alert(info);
		}
		socket.off('join room');
	});
}
function quickJoinRoom(room) {
	socket.emit('quick join room', room._id);
	socket.on('quick join room', (success, info) => {
		if (success) {
			//save to sessionStorage
			room = Object.assign({
				name: quickJoinRoomName
			}, info);
			pageEvents.fireEvent('OnJoinRoom');
		} else {
			alert(info); //name is msg if error
		}
	});
}

