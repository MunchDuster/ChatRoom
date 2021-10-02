var socket;
function setSocket(sock) {
	console.log("socket set");
	socket = sock;
	socket.on("login result", OnLoginResult);
	socket.on("signup result", OnSignUpResult);
};


const nameInput = document.querySelector('input[type="text"]');
const passInput = document.querySelector('input[type="password"]');

function login() {
	console.log(nameInput.value + ", " + passInput.value);
	socket.emit("login attempt", nameInput.value, passInput.value);
}
function signup() {
	socket.emit("signup attempt", nameInput.value, passInput.value);
}


function OnLoginResult(success, err) {
	if (!success) {
		//something failed, probably incorrect password or username
		alert('Incorrect username or password.');
	} else {
		//contine to rooms page
		loadPage('rooms.html');
	}
}
function OnSignUpResult(success, err) {
	if (!success) {
		//something failed, probably username has already been taken
		alert('Username already taken.');
	} else {
		//contine to rooms page
		loadPage('rooms.html');;
	}
}