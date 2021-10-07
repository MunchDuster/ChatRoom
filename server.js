//CONTROL VARS
const PORT = process.env.PORT || 8080;

const mainPage = '/Client/about.html';

//Dependency packages
const express = require("express");
const app = express();
const node_cleanup = require('node-cleanup');

//local dependencies
const { MessageType } = require("./enums");
const { findRoomByName, findRoomByNameOnly, findRoomById, makeRoom, removeRoom, importRoom } = require("./rooms");
const { findUserByName, findUserByNameOnly, findUserById, makeUser, removeUser, importUser } = require("./users");


//Database setup
const { MongoClient } = require('mongodb');
const res = require("express/lib/response");
const uri = "mongodb+srv://themrduder:mememan@cluster0.sm7hr.mongodb.net/Database01?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Database collections
var userCollection;
var roomCollection;
var messageCollection;

//Listen for node exit, better before connecting to database
node_cleanup(onExit);

//Connect to database
client.connect(OnMongoClientConnected);

async function OnMongoClientConnected(err) {
	if (err) {
		console.error(`Failed to connect to database: ${err}`);
		return;
	} else {
		console.log('Connected to database successfully.');
	}

	userCollection = client.db("Database01").collection("Users");
	roomCollection = client.db("Database01").collection("Rooms");
	messageCollection = client.db("Database01").collection("Logs");

	// Clear database
	// messageCollection.deleteMany({});
	// userCollection.deleteMany({});
	// roomCollection.deleteMany({});

	postListeners();
	socketListeners();
}

async function postListeners() {
	//CLIENT SIDE FILES
	app.use(express.static(__dirname + "/Client"));
	app.use(express.json());


	//Listen for the main page
	app.get('/', (req, res) => {
		res.sendFile(__dirname + '/Client/login.html');
	});

	app.post('/login', async (req, res) => {
		var { username, userpass } = req.body;
		console.log(`login attempt: ${username}, ${userpass}`);

		var users = await findUserByName(userCollection, username, userpass).catch(err => {
			console.log('login database query failed: ' + err);
		});

		if (users.length == 0) {
			//log to console
			console.log('login attempt failed: no user exists.');
			//tell client: fail
			res.send({ success: false, data: 'No such user exists.' });
		} else {
			//import user from database data
			var user = importUser(users[0]);
			//log to console
			console.log(`${user.name} logged in.`);

			//get user recent rooms
			var recentRoomsIds = user.recentRoomIds;

			var recentRooms = [];

			for (var i = 0; i < recentRoomsIds.length; i++) {
				var room = (await roomCollection.find({ _id: recentRoomsIds[i].roomId }).toArray())[0];
				recentRooms.push({ name: room.name, date: recentRoomsIds[i].lastAccessed, description: room.description })
			}

			//get user's rooms
			rooms = await roomCollection.find({ ownerId: user._id }).toArray();
			var myRooms = [];
			for (var i = 0; i < rooms.length; i++) {
				var room = rooms[i];
				myRooms.push({ name: room.name, date: room.ownerLastAccessed, description: room.description })
			}

			//tell client: success
			res.send({ success: true, data: { recentRooms: recentRooms, myRooms: myRooms } });
		}
	});

	app.post('/signup', async (req, res) => {
		const { username, userpass } = req.body;

		var users = await findUserByName(userCollection, username, userpass).catch(err => {
			tellError(socket, "Signup attempt", err, user, room);
		});

		if (users.length > 0) {
			//log to console
			console.log('signup attempt failed: user already registered');
			//tell client: fail
			res.send({ success: false, err: 'User already exists.' });
		} else {
			//import user from database data
			user = await makeUser(userCollection, username, userpass);
			//log to console
			console.log(username + ' signed up.');
			//tell client: success
			res.send({ success: true });
		}
	});

	app.post('/newroom', async function (req, res) {
		var { roomname, roompass, roomdesc, suername, username, userpass } = req.body;

		var rooms = await findRoomByName(roomCollection, roomname, roompass).catch(err => {
			console.error(`Create room error: ${roomname}, ${roompass}, ${roomdesc}:\n${err}`);
		});
		if (rooms == null) { return; }

		if (rooms.length > 0) {
			//log to console
			console.log('create room attempt failed, already exists.');
			//tell client: fail
			res.send({ success: false, info: 'Room with name already exits already exists.' });
		} else {
			var users = await userCollection.find({ name: username, password: userpass }).toArray();
			if (users.length == 0) {
				console.log('new room load failed: owner does not exist.');

			}
			else {
				user = users[0];
				//import room from database data
				var room = await makeRoom(roomCollection, roomname, roompass, roomdesc, user._id);
				//log to console
				console.log(room.name + ' has been created.');
				//tell client: success
				res.send({ success: true });
			}
		}
	});

	app.post('/joinroom', async function (req, res) {
		var { roomname, roompass } = req.body;

		var rooms = await findUserByName(roomCollection, roomname, roompass).catch(err => {
			console.error(`Join room error: ${roomname}, ${roompass}:\n${err}`);
		});

		if (rooms.length > 0) {
			//log to console
			console.log('join room attempt success');
			//get first room
			var room = rooms[0];
			//tell client: success
			var roomInfo = {
				description: room.description,
				ownerId: room.ownerId
			};
			res.send({ success: true, info: roomInfo });
		} else {

			console.log('join room attempt failure: room does not exist.');
			//tell client: success
			res.send({ success: false, info: "Room does not exist." });
		}
	});
	app.post('/quickjoinroom', async function (req, res) {
		var { roomname } = req.body;
		console.log(`attempt quick join room: ${roomname}`);

		var rooms = await findUserByNameOnly(roomCollection, roomname).catch(err => {
			console.error(`Join room error: ${roomname}:\n${err}`);
		});

		if (rooms.length > 0) {
			//log to console
			console.log('quick join room attempt success');
			//get first room
			var room = rooms[0];
			//tell client: success
			var roomInfo = {
				password: room.password,
				description: room.description,
				ownerId: room.ownerId
			};
			res.send({ success: true, info: roomInfo });
		} else {

			console.log('join room attempt failure: room does not exist.');
			//tell client: success
			res.send({ success: false, info: "Room does not exist." });
		}
	});
}
async function socketListeners() {
	//Start the server
	const server = app.listen(PORT, () => { console.log(`listening on PORT ${PORT}`); });
	const io = require('socket.io').listen(server);

	//vars
	var user;
	var room;

	//Handle socket.io connections
	io.on('connection', (socket) => {
		var user, room,
			verified = false;
		socket.on('verify', async (username, userpass, roomname, roompass) => {
			console.log(`verification data: ${username}, ${userpass}, ${roomname}, ${roompass}`);
			//setup user and room
			var users = await findUserByName(userCollection, username, userpass);
			var rooms = await findRoomByName(roomCollection, roomname, roompass);

			if (rooms.length == 0) {
				console.error('No room found in verify');
				socket.emit('chat log', false, 'Room does not exist.');
				return;
			}
			if (users.length == 0) {
				console.error('No users found in verify');
				socket.emit('chat log', false, 'User does not exist.');
				return;
			}

			var loadedRoom = rooms[0];
			var loadedUser = users[0];

			user = importUser(loadedUser);
			room = importRoom(loadedRoom);

			//update the user lists
			user.enterRoom(userCollection, room);
			//add user to room socket
			socket.join(room.name);
			//add user to room
			room.addUser(messageCollection, user);
			//send the user the chat log latest 50 messages
			var top50messages = await room.getTopMessages(messageCollection, 50);
			socket.emit('chat log', true, top50messages);

			verified = true;
		});
		socket.on('chat msg', async (text) => {
			if (!verified) { return; }

			var msg = await room.addMessage(messageCollection, text, user).catch(err => {
				console.error(`Error in chat message: ${err}`);
			});

			console.log(`${user.name} sent message to room \'${room.name}\'.`);
			socket.to(room.name).emit('chat msg', msg);
		});
		socket.on('disconnect', async function () {
			if (!verified) { return; }

			console.log(`${user.name} disconnected.`);
			//remove this socket from user sockets
			user.sockets.splice(user.sockets.indexOf(socket), 1);
			//remove user from room
			room.removeUser(messageCollection, user);
		});
	});
}

function onExit(exitCode, signal) {
	client.close();
	console.log('exitting');
}

