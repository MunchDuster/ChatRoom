var pageEvents = {
	'OnJoinRoom': {
		callbacks: [],
		getParameters: function () {
			return { room };
		}
	},
	'OnUserLogin': {
		callbacks: [],
		getParameters: function () {
			return { user };
		}
	},
	'OnUserSignup': {
		callbacks: [],
		getParameters: function () {
			return { user };
		}
	},

	fireEvent: function (eventName) {
		var event = pageEvents[eventName];
		if (event == null) {
			console.log(`cannot call event ${eventName}, because it does not exist.`);
			return;
		}

		for (var i = 0; i < event.callbacks.length; i++) {
			var callback = event.callbacks[i];
			callback();
		}

	},
	addListener: function (eventName, listener) {
		var event = pageEvents[eventName];
		if (event == null) {
			console.log(`cannot call event ${eventName}, because it does not exist.`);
			return;
		}
		console.log(event);

		event.callbacks.push(listener);
	}
}