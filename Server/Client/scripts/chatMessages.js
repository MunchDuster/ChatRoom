const textInput = document.querySelector(".InputText");
const sendButton = document.querySelector(".SendButton");


//Resize the input box
function autoResize() {
	textInput.style.height = '0px';
	textInput.style.height = (textInput.scrollHeight) + 'px';
	sendButton.style.height = (textInput.scrollHeight) + 'px';
	messagesBox.scrollTop = messagesBox.scrollHeight;


	//scroll to bottom of page
	window.scrollTo(0, document.body.scrollHeight);
}
window.addEventListener('resize', autoResize);
autoResize();


//Socket
var socket = io();

//Temporary until user icons are sorted.
var userIcon = 'images/mememan.png';

//socket handlers and listeners

//load the user
var user;
var loadedData = sessionStorage.getItem('user');
if (loadedData != 'undefined') {
	user = JSON.parse(loadedData);

} else {
	window.location.href = '/login.html';
}

//loaded the room
var room;
loadedData = sessionStorage.getItem('room');
if (loadedData != 'undefined') {
	room = JSON.parse(loadedData);

} else {
	window.location.href = '/login.html';
}

if (user != null && room != null) {
	socket.emit('verify', user.name, user.password, room.name, room.password);
} else {
	console.log(`can't veriify becaue of missing data:\nuser: ${user}\nroom: ${room}`);
}


socket.on('chat log', (success, messages) => {
	if (!success) {
		alert('unable to get chat log.');
		return;
	}

	//log recieved meessages
	console.log(`recieving messages: ${messages.length}.`);

	//display recieved messages
	for (var i = 0; i < messages.length; i++) {
		displayUserMessage(messages[i].sender, userIcon, messages[i].date, messages[i].message);
	}

	//scroll to bottom
	messagesBox.scrollTo(0, messagesBox.scrollHeight);
});
socket.on('chat msg', (message) => {
	//log to console
	console.log('recieved message');

	//display user message
	displayUserMessage(message.sender, userIcon, message.date, message.message);

	//scroll to bottom
	messagesBox.scrollTo(0, messagesBox.scrollHeight);
});

function sendMessage() {
	if (textInput.value == '') return;

	//log to console
	console.log('sending message');

	//tell server
	socket.emit('chat msg', textInput.value);
	//display message
	displayUserMessage(user.name, userIcon, getDate(), textInput.value);

	//clear input box
	textInput.value = '';
	//update input box new size
	autoResize();
}
function getDate() {
	var date = new Date();
	return Math.floor(date.getTime() / 60000) + date.getTimezoneOffset();
}