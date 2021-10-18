//CONTROL VARS
const PORT = process.env.PORT || 8080;

const mainPage = '/Client/chat.html';

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
		res.sendFile(__dirname + mainPage);
	});

}
async function socketListeners() {
	//Start the server
	const server = app.listen(PORT, () => { console.log(`listening on PORT ${PORT}`); });
	const io = require('socket.io').listen(server);

	//Handle socket.io connections
	io.on('connection', (socket) => {
		var user, room;


		socket.on('login', async (username, userpass) => {
			console.log(`login attempt: ${username}, ${userpass}`);

			var users = await findUserByName(userCollection, username, userpass).catch(err => {
				console.log('login database query failed: ' + err);
			});

			if (users.length == 0) {
				//log to console
				console.log('login attempt failed: no user exists.');
				//tell client: fail
				socket.emit('login', false, 'No such user exists.');
			} else {
				//import user from database data
				user = importUser(users[0]);
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
				socket.emit('login', true, { recentRooms: recentRooms, myRooms: myRooms });
			}
		});
		socket.on('signup', async (username, userpass) => {
			var users = await findUserByName(userCollection, username, userpass).catch(err => {
				tellError(socket, "Signup attempt", err, user, room);
			});

			if (users.length > 0) {
				//log to console
				console.log('signup attempt failed: user already registered');
				//tell client: fail
				socket.emit('signup', false, 'User already exists.');
			} else {
				//import user from database data
				user = await makeUser(userCollection, username, userpass);
				//log to console
				console.log(username + ' signed up.');
				//tell client: success
				socket.emit('signup', true);
			}
		});
		socket.on('make room', async function (roomname, roompass, roomdesc) {
			//get list of viable rooms
			var rooms = await findRoomByName(roomCollection, roomname, roompass).catch(err => {
				console.error(`Create room error: ${roomname}, ${roompass}, ${roomdesc}:\n${err}`);
			});
			if (rooms == null) { return; }


			if (rooms.length > 0) {
				//log to console
				console.log('create room attempt failed, already exists.');
				//tell client: fail
				socket.emit('make room', false, 'Room with name already exits already exists.');
			} else {
				//import room from database data
				room = await makeRoom(roomCollection, roomname, roompass, roomdesc, user._id).catch(err => {
					console.log('make room error: ' + err);
				});
				//log to console
				console.log(room.name + ' has been created.');
				//tell client: success
				socket.emit('make room', true);
			}
		});
		socket.on('join room', async function (roomname, roompass) {

			var rooms = await findUserByName(roomCollection, roomname, roompass).catch(err => {
				console.error(`Join room error: ${roomname}, ${roompass}:\n${err}`);
			});

			if (rooms.length > 0) {
				//log to console
				console.log('join room attempt success');
				//get first room
				room = await importRoom(rooms[0]);
				//tell client: success
				var roomInfo = {
					description: room.description,
					ownerId: room.ownerId
				};
				socket.emit('join room', true, roomInfo);
			} else {

				console.log('join room attempt failure: room does not exist.');
				//tell client: success
				socket.emit('join room', false, 'Room does not exist.');
			}
		});
		socket.on('quick join room', async function (roomname) {

			console.log(`attempt quick join room: ${roomname}`);

			var rooms = await findUserByNameOnly(roomCollection, roomname).catch(err => {
				console.error(`Join room error: ${roomname}:\n${err}`);
			});

			if (rooms.length > 0) {
				//log to console
				console.log('quick join room attempt success');
				//get first room
				room = rooms[0];
				//tell client: success
				var roomInfo = {
					password: room.password,
					description: room.description,
					ownerId: room.ownerId
				};
				socket.emit('quick join room', true, roomInfo);
			} else {

				console.log('join room attempt failure: room does not exist.');
				//tell client: success
				socket.emit('quick join room', false, 'Room does not exist.');
			}
		});
		socket.on('chat msg', async (text) => {
			var msg = await room.addMessage(messageCollection, text, user).catch(err => {
				console.error(`Error in chat message: ${err}`);
			});

			console.log(`${user.name} sent message to room \'${room.name}\'.`);
			socket.to(room.name).emit('chat msg', msg);
		});
		socket.on('disconnect', async function () {
			if (user == null) return;

			console.log(`${user.name} disconnected.`);
			//remove this socket from user sockets
			user.sockets.splice(user.sockets.indexOf(socket), 1);


			if (room == null) return;
			//remove user from room
			room.removeUser(messageCollection, user);
		});
	});
}

function onExit(exitCode, signal) {
	client.close();
	console.log('exitting');
}

