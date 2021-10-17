const textInput = document.querySelector(".InputText");
const sendButton = document.querySelector(".SendButton");
const messagesBox = document.querySelector(".MessagesBox");




events.addListener('OnJoinRoom', () => {
	document.querySelector('.Rooms').style.display = 'none';
	document.querySelector('.Chat').style.display = 'block';
});






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


//Temporary until user icons are sorted.
var userIcon = 'images/mememan.png';

//socket handlers and listeners


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