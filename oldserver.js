//CONTROL VARS
const PORT = process.env.PORT || 8080;

const mainPage = '/Client/about.html';

//REQUIREMENTS
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const node_cleanup = require('node-cleanup');

const { MessageType } = require("./enums");
const { findRoomByName, findRoomByNameOnly, findRoomById, makeRoom, removeRoom, importRoom } = require("./rooms");
const { findUserByName, findUserByNameOnly, findUserById, makeUser, removeUser, importUser } = require("./users");


//DATABASE SETUP
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://themrduder:mememan@cluster0.sm7hr.mongodb.net/Database01?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Listen for node exit
node_cleanup(onExit);
//connect to database
client.connect(OnMongoClientConnected);

//database collections
var userCollection;
var roomCollection;
var messageCollection;

async function OnMongoClientConnected(err) {
	if (err) {
		console.log("Connection failed: " + err);
	} else {
		console.log("Connected successfully.")
	}
	userCollection = client.db("Database01").collection("Users");
	roomCollection = client.db("Database01").collection("Rooms");
	messageCollection = client.db("Database01").collection("Logs");

	postListeners();
	socketListeners();
	createServer();
}
//CLIENT SIDE FILES
app.use(express.static(__dirname + "/Client"));//path.join(__dirname, "/Client")));

//LISTENERS
function postListeners() {
	// GET listeners
	app.get("/", function (req, res) {
		res.sendFile(__dirname + mainPage);
	});
	// POST listeners
	app.post("/login", function (req, res) {
		res.sendFile(__dirname + mainPage);
		console.log('logging in');
	});
}
function socketListeners() {
	io.on("connection", function (socket) {
		var user, room;

		//Socket listeners

		socket.on('quick join room attempt', OnQuickJoinRoomAttempt);
		socket.on("join room attempt", OnJoinRoom);
		socket.on("leave room", OnLeaveRoom);
		socket.on("make room attempt", OnMakeRoom);
		socket.on('request rooms', OnRoomsRequest);

		socket.on("changed name", OnChangedName);

		socket.on("chat msg", OnChatMessage);
		socket.on("disconnect", OnDisconnect);
		socket.on("request chat log", OnChatLogRequest);

		//Socket event handlers
		async function OnRoomsRequest() {

			//get user's recent rooms
			var recentRooms = [];
			for (var i = 0; i < user.recentRoomIds.length; i++) {
				var roomId = user.recentRoomIds[i].roomId;
				console.log(`GIVING: ${roomId}`);
				console.log(roomId);
				if (roomId != null) {
					var roomList = await findRoomById(roomCollection, roomId).catch(err => {
						console.error(err);
					});

					var room = await importRoom(roomList[0]);
					room.lastAccessed = user.recentRoomIds[i].lastAccessed;
					recentRooms.push(room);
				}
			}


			//get user's rooms
			var myRooms = await roomCollection.find({ ownerId: user._id }).toArray();

			//log to console
			console.log(user.name + ' has been in ' + recentRooms.length + ' rooms recently.');
			console.log(user.name + ' owns ' + myRooms.length + ' rooms.');

			//send to user	
			socket.emit('request rooms result', recentRooms, myRooms);
		}
		async function OnLoginAttempt(username, password) {
			findUserByName(userCollection, username, password).then((res) => {
				if (res.length == 0) {
					console.log('login attempt failed');
					socket.emit('login result', false);
				} else {
					//import user from database data
					user = importUser(res[0]);
					//log to console
					console.log(user.name + ' logged in.');
					//tell client: success
					socket.emit('login result', true);
				}
			}).catch(err => {
				tellError(socket, "Login attempt", err, user, room);
			});
		}
		async function OnSignUp(userName, userPassword) {
			findUserByNameOnly(userCollection, userName, userPassword).then(users => {
				if (users.length == 0) {
					makeUser(userCollection, userName, userPassword, socket.id).then(newuser => {
						user = newuser;
						//log to console
						console.log('new user: ' + user.name);
						//tell client: success
						socket.emit('signup result', true);
					}).catch(err => {
						console.log('Create user error: ' + err);
					});
				} else {
					socket.emit('signup result', false);
				}
			}).catch(err => {
				tellError(socket, "Sign up", err, user, room);
			});
		}
		async function OnChatMessage(msg) {
			room.addMessage(messageCollection, msg, user).then(msg => {
				console.log(user.name + ' sent message to room \'' + room.name + '\'.');
				socket.to(room.name).emit("receive chat", msg);
			}).catch(err => {
				tellError(socket, "Chat message", "receive chat", err, user, room);
			});
		}
		async function OnChangedName(newname) {

		}
		async function OnJoinRoom(roomName, roomPassword) {
			var roomList = await findRoomByName(roomCollection, roomName, roomPassword).catch(err => {
				tellError(socket, "Join room", "join room result", err, user, room);
			});

			if (roomList.length > 0) {
				//success, create room from database room. Database room doesn't have functions
				room = await importRoom(roomList[0]).catch(err => {
					tellError(socket, "Import room", "join room result", err, user, room);
				});
				//log to console
				console.log('connected ' + user.name + ' to room ' + room.name);
				//update the uer lists
				user.enterRoom(userCollection, room);
				//add user to room socket
				socket.join(room.name);
				//add user to room
				room.addUser(messageCollection, user);
				//tell client: success
				socket.emit('join room result', true, room.description);
			} else {
				//fail
				console.log('room not found');
				socket.emit('join room result', false, 'incorrect password or name.');
			}
		}
		async function OnQuickJoinRoomAttempt(roomName, userOwnsRoom) {
			var rooms = await findRoomByNameOnly(roomCollection, roomName).catch(err => {
				tellError(socket, "Quick join room attempt", "quick join room result", err, user, room);
			});

			console.log('returned value');
			console.log(rooms);

			if (rooms.length > 0) {
				//set room as first found
				room = await importRoom(rooms[0]);

				if (userOwnsRoom) {
					room.ownerLastAccessed = getDate();
				}

				//update user lists
				user.enterRoom(userCollection, room);

				//update room lists and add join message
				room.addUser(messageCollection, user);

				//log to console
				console.log(user.name + ' has quick joined to \'' + room.name + '\'.');

				//tell client: success
				console.log('room is ', room);
				socket.emit('quick join room result', true, room.name, room.description, room.password);
			} else {
				//log to console
				console.log(user.name + ' failed to find room.');

				//tell client: fail
				socket.emit('quick join room result', false);
			}
		}
		async function OnChatLogRequest() {
			if (user != null && room != null) {
				//user has requested chat log of current room
				var messages = await room.loadMessages(messageCollection).catch(err => {
					tellError(socket, "Chat log request", "chat log result", err, user, room);
				});

				socket.emit('chat log result', true, messages);
			}
			else {
				socket.emit('chat log result', false);
			}

		}
		async function OnLeaveRoom() {
			room.removeUser(messageCollection, user).then(leftMessage => {

			}).catch(err => {
				tellError(socket, "Leave room", "leave room result", err, user, room);
			});
		}
		async function OnMakeRoom(roomName, roomPassword, roomDescription) {
			//Try see if room already exists
			findRoomByNameOnly(roomCollection, roomName).then(async function (roomList) {
				//Room already exists
				if (roomList.length > 0) {
					//log to console
					console.log(user.name + ' tried to make room that already exists.');
					//tell the client: fail
					socket.emit('make room result', false, 'room already exists.');
				}
				//Room doesnt exist yet
				else {
					//create the room
					makeRoom(roomCollection, roomName, roomPassword, roomDescription, user._id).then(newroom => {
						room = newroom;
						//log to console
						console.log(user.name + ' made room: \'' + room.name + '\'');
						console.log('connected ' + user.name + ' to \'' + room.name + '\'');

						//Add room to user lists [like recentRoomIds]
						user.enterRoom(userCollection, room);
						//join the user socket to the room
						socket.join(room.name);
						//tell the client: success
						socket.emit('make room result', true);
					}).catch(err => {
						tellError(socket, "Create room", "make room result", err, user, room);
					});
				}
			}).catch(err => {
				tellError(socket, "Make room", "make room result", err, user, room);
			});
		}
		function OnDisconnect() {
			if (user != null) {
				console.log(user.name + ' disconnected.');

				if (room != null) {
					//room.removeUser(messageCollection, user);
				}
				var index = user.sockets.indexOf(socket.id);
				user.sockets.splice(index, 1);

				//user.removeRoom();
			}
		}
	});
}

function createServer() {
	http.listen(PORT, () => {
		console.log("listening on " + PORT);
	});
}
function onExit(exitCode, signal) {
	client.close();
	console.log('exitting');
}

function tellError(socket, functionName, responseName, err, user, room) {
	console.log(functionName + " error:" + err);
	console.log("Stack trace: " + new Error().stack);
	console.log("User is ", user);
	console.log("Room is ", room);
	socket.emit(responseName, false, 'There was an error in the server, reload the page and try again.');
}