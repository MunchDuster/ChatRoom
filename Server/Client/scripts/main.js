var socket = io();

var iframe = document.querySelector("iframe");
function reloadPage() {
	iframe.contentWindow.location.reload();
}

var room = {};
var user = {};

iframe.onload = () => {
	iframe.contentWindow.setSocket(socket, user, room);
	iframe.contentWindow.getRoom = function (roomName, roomDescription, pass) {
		console.log('getting room');
		room.name = roomName;
		room.description = roomDescription;
		room.password = pass;
	}
	iframe.contentWindow.loadPage = function (url) {
		console.log('page loaded');
		iframe.src = url;
	};
	console.log('set room = ' + iframe.contentWindow.setRoom);
	if (iframe.contentWindow.setRoom) {
		console.log('setting room');
		iframe.contentWindow.setRoom(room);
	}
};