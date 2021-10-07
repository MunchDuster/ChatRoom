const nameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');


function login() {
	// socket.emit("login attempt", nameInput.value, passwordInput.value);
	const data = {
		username: nameInput.value,
		userpass: passwordInput.value
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	fetch('/login', options)
		.then(response => response.json())
		.then(OnLoginResult)
		.catch(err => console.error(`Login error: ${err}`));
}
function signup() {
	// socket.emit("signup attempt", nameInput.value, passwordInput.value);
	const data = {
		username: nameInput.value,
		userpass: passwordInput.value
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	fetch('/signup', options)
		.then(response => response.json())
		.then(OnSignUpResult)
		.catch(err => console.error(`Sign up error: ${err}`));
}


function OnLoginResult({ success, data }) {
	if (success) {
		console.log('login successful');
		//set the user in sessionstorage for other pages on site
		var nameAndPass = { name: nameInput.value, password: passwordInput.value }
		var userInfo = Object.assign(nameAndPass, data)
		sessionStorage.setItem('user', JSON.stringify(userInfo));
		//contine to rooms page
		window.location.href = '/rooms.html';
	} else {
		console.log('login fail');
		//something failed, probably incorrect password or username
		alert(data);
	}
}
function OnSignUpResult({ success, err }) {
	if (success) {
		console.log('signup successful');
		//set the user in sessionstorage for other pages on site
		sessionStorage.setItem('user', JSON.stringify({
			name: nameInput.value,
			password: passwordInput.value,
			recentRooms: [],
			myRooms: []
		}));
		//contine to rooms page
		window.location.href = '/rooms.html';
	} else {

		console.log('signup fail');
		//something failed, probably username has already been taken
		alert(err);
	}
}


window.addEventListener('load', function () {
	var storedUser = sessionStorage.getItem('user');
	if (storedUser != null) {
		nameInput.value = storedUser.name;
		passwordInput.value = storedUser.password;
	}
});