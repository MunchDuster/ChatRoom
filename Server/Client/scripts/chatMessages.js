const textInput = document.querySelector(".InputText");
const sendButton = document.querySelector(".SendButton");


//Resize the input box
function autoResize() {
	textInput.style.height = '0px';
	textInput.style.height = (textInput.scrollHeight) + 'px';
	sendButton.style.height = (textInput.scrollHeight) + 'px';
	messagesBox.scrollTop = messagesBox.scrollHeight;
}
window.addEventListener('resize', autoResize);
autoResize();


//Socket
var socket;

//Temporary until user icons are sorted.
var userIcon = 'images/mememan.png';

function setSocket(sock, user, room) {
	if (user == null || room == null) {
		alert('Please refresh the page and sign in.');
		return;
	}
	socket = sock;

	socket.emit('request chat log');
	socket.on('chat log result', OnRecieveChatLog);
	socket.on('receive chat', OnRecieveChat);

	function OnRecieveChat(message) {
		console.log('recieved message');
		displayUserMessage(message.sender, userIcon, message.date, message.message);
	}
	function OnRecieveChatLog(success, messages) {
		if (!success) alert('unable to get chat log.');

		user.name = username;
		console.log('recieving messages: ' + messages.length + ' and username = ' + username);
		for (var i = 0; i < messages.length; i++) {
			displayUserMessage(messages[i].sender, userIcon, messages[i].date, messages[i].message);
		}
	}
}
function sendMessage() {
	var message = textInput.value;
	textInput.value = '';
	autoResize();
	socket.emit('chat msg', message);
	//displayUserMessage(userName, userIcon, date, message)
	console.log(user.name);
	displayUserMessage(user.name, userIcon, getDate(), message);
}
function getDate() {
	var date = new Date();
	return Math.floor(date.getTime() / 60000) + date.getTimezoneOffset();
}