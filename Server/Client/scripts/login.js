const nameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');


function login() {
	// socket.emit("login attempt", nameInput.value, passwordInput.value);
	const data = {
		username: nameInput.value,
		userpass: passwordInput.value
	};
	console.log(`passwordInput is ${passwordInput}`);
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


function OnLoginResult({ success, err }) {
	if (success) {
		//set the user in sessionstorage for other pages on site
		sessionStorage.setItem('user', JSON.stringify({ name: nameInput.value, password: passwordInput.value }));
		//contine to rooms page
		window.location.href = '/rooms.html';
	} else {
		//something failed, probably incorrect password or username
		alert('Incorrect username or password.');
	}
}
function OnSignUpResult({ success, err }) {
	if (success) {
		//set the user in sessionstorage for other pages on site
		sessionStorage.setItem('user', JSON.stringify({ name: nameInput.value, password: passwordInput.value }));
		//contine to rooms page
		window.location.href = '/rooms.html';
	} else {
		//something failed, probably username has already been taken
		alert('Login failed');
	}
}


window.addEventListener('load', function () {
	var storedUser = sessionStorage.getItem('user');
	if (storedUser != null) {
		nameInput.value = storedUser.name;
		passwordInput.value = storedUser.password;
	}
});