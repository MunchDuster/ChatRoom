const textInput = document.querySelector(".InputText");
const sendButton = document.querySelector(".SendButton");
const messagesBox = document.querySelector(".MessagesBox");

setSizeOfMessageBox(textInput);


pageEvents.addListener('OnJoinRoom', () => {
	document.querySelector('.Rooms').style.display = 'none';
	document.querySelector('.Chat').style.display = 'block';

	//display previous messages
	if (room.messages) {
		//display recieved messages
		for (var i = 0; i < room.messages.length; i++) {
			displayUserMessage(room.messages[i].sender, userIcon, room.messages[i].date, room.messages[i].message);
		}

		//scroll to bottom
		messagesBox.scrollTo(0, messagesBox.scrollHeight);
	}
});






//Resize the input box
function autoResize() {
	console.log('resizing');
	textInput.style.height = '0px';
	textInput.style.height = (textInput.scrollHeight) + 'px';
	sendButton.style.height = (textInput.scrollHeight) + 'px';
	messagesBox.scrollTop = messagesBox.scrollHeight;


	//scroll to bottom of page
	window.scrollTo(0, document.body.scrollHeight);
}
window.addEventListener('resize', autoResize);


//Temporary until user icons are sorted.
var userIcon = 'images/mememan.png';

//socket handlers and listeners


socket.on('chat msg', (message) => {
	//log to console
	console.log('recieved message');

	//display user message
	displayUserMessage(message.sender, userIcon, message.date, message.message);

	//scroll to bottom
	messagesBox.scrollTo(0, messagesBox.scrollHeight);

	//make the title have an alert i window is not focused
	if (!document.hasFocus()) {
		//change the page icon
		document.querySelector("link[rel=\"shortcut icon\"]").href = 'images/notification.png';
	}
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