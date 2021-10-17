var user = {};


//PRIVATE VARS
var lastUserToDisplayMessage;
var loadedUserIcons = [];


//PUBLIC FUNCTIONS
function displayUserMessage(userName, userIcon, date, message) {
	if (lastUserToDisplayMessage == userName) {
		displayUserMessageWithNoName(userName, date, message);
	} else {
		displayUserMessageWithName(userName, userIcon, date, message);
	}

	lastUserToDisplayMessage = userName;
}

//PRIVATE FUNCTIONS
function displayUserMessageWithName(userName, userIcon, date, message) {
	const messageDiv = document.createElement("div");

	const userNameDiv = document.createElement("div");

	const userIconImg = document.createElement("img");
	var sendTimeDiv = document.createElement("div");
	const contentDiv = document.createElement("div");


	userNameDiv.innerText = userName;
	userIconImg.src = userIcon;

	sendTimeDiv.innerText = getRelativeTime(new Date(date));
	contentDiv.innerText = message;

	if (user.name == userName) {
		//put messages on my side
		userNameDiv.classList.add("MessageSenderName");
		userIconImg.classList.add("MessageSenderIcon");
		sendTimeDiv.classList.add("MessageSendTime");
	} else {
		//put messages on other side
		userNameDiv.classList.add("MessageSenderNameOther");
		userIconImg.classList.add("MessageSenderIconOther");
		sendTimeDiv.classList.add("MessageSendTimeOther");

		messageDiv.classList.add("OtherMessage");
	}

	messageDiv.classList.add("ChatMessage");
	contentDiv.classList.add("MessageContent");

	messageDiv.appendChild(userIconImg);
	messageDiv.appendChild(userNameDiv);
	messageDiv.appendChild(document.createElement("br"));

	messageDiv.appendChild(sendTimeDiv);

	messageDiv.appendChild(document.createElement("br"));
	messageDiv.appendChild(contentDiv);

	messagesBox.appendChild(messageDiv)

	return contentDiv;
}
function displayUserMessageWithNoName(userName, date, message) {
	const messageDiv = document.createElement("div");

	const sendTimeDiv = document.createElement("div");
	const contentDiv = document.createElement("div");

	sendTimeDiv.innerText = getRelativeTime(date);
	contentDiv.innerText = message;

	if (user.name == userName) {
		//put messages on my side
		sendTimeDiv.classList.add("MessageSendTime");
	} else {
		//put messages on other side
		sendTimeDiv.classList.add("MessageSendTimeOther");

		messageDiv.classList.add("OtherMessage");
	}

	messageDiv.classList.add("ChatMessage");
	contentDiv.classList.add("MessageContent");

	messageDiv.appendChild(sendTimeDiv);
	messageDiv.appendChild(contentDiv);

	messagesBox.appendChild(messageDiv)

	return contentDiv;
}
