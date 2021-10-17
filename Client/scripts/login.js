const nameInput = document.querySelector('input[name="UserName"]');
const passwordInput = document.querySelector('input[name="UserPassword"]');

function login() {
	socket.emit('login', nameInput.value, passwordInput.value);
	socket.on('login', (success, data) => {
		if (success) {
			console.log('login successful');
			//set the user in sessionstorage for other pages on site
			var nameAndPass = { name: nameInput.value, password: passwordInput.value }
			user = Object.assign(nameAndPass, data);
			console.log('setting user as');
			console.log(user);
			events.fireEvent('OnUserLogin');
		} else {
			console.log('login fail');
			//something failed, probably incorrect password or username
			alert(data);
		}
		socket.off('login');
	});
}
function signup() {
	socket.emit('signup', nameInput.value, passwordInput.value);
	socket.on('signup', (success, err) => {
		if (success) {
			console.log('signup successful');
			//set the user in sessionstorage for other pages on site
			user = {
				name: nameInput.value,
				password: passwordInput.value,
				recentRooms: [],
				myRooms: []
			};
			events.fireEvent('OnUserSignup');
		} else {

			console.log('signup fail');
			//something failed, probably username has already been taken
			alert(err);
		}

		socket.off('signup');
	});
}