module.exports = { findRoomByName, findRoomByNameOnly, findRoomById, makeRoom, removeRoom, importRoom };

const { type } = require("express/lib/response");
const { MessageType } = require("./enums");
const { getDate } = require("./getDate.js");
const ObjectID = require('mongodb').ObjectID;

function findRoomByName(roomCollection, roomName, roomPassword) {
	var stuff = roomCollection.find({ name: roomName, password: roomPassword });
	return stuff.toArray();
}
function findRoomByNameOnly(roomCollection, roomName) {
	return roomCollection.find({ name: roomName }).toArray();
}
async function findRoomById(roomCollection, room_id) {
	console.log(room_id);
	var allRooms = await roomCollection.find({}).toArray();
	var returnVals = [];
	for (var i = 0; i < allRooms.length; i++) {
		var room = allRooms[i];
		var roomID = room._id;
		var myroomID = room_id;
		console.log('this room id: ' + roomID);
		console.log('test id:      ' + room_id);
		console.log('this room type: ' + typeof (roomID));
		console.log('test type:      ' + typeof (myroomID));
		console.log(myroomID.equals(roomID));

		if (myroomID.equals(roomID)) {
			returnVals.push(room);
		}
	}
	return returnVals;
}
async function importRoom(loadedRoom) {
	var room = await makeRoomObj(loadedRoom.name, loadedRoom.password, loadedRoom.description, loadedRoom.ownerId);
	console.log('37: ', loadedRoom);
	room._id = loadedRoom._id;
	return room;
}
function removeRoom(room) {

}
async function makeRoom(roomCollection, roomName, roomPassword, roomDescription, roomOwnerId) {
	var room = makeRoomObj(roomName, roomPassword, roomDescription, roomOwnerId);
	var val = await roomCollection.insertOne(room);
	room._id = val.insertedId;
	return room;
}
function makeRoomObj(name, pass, desc, ownerId) {
	return {
		name: name,
		password: pass,
		description: desc,
		ownerId: ownerId,
		ownerLastAccessed: getDate(),
		userIds: [ownerId],
		messages: [],
		creationDate: getDate(),

		addUser: async function (messageCollection, user) {
			var messageObj = {
				message: user.name + " has joined.",
				user: user,
				date: getDate(),
				type: MessageType.USER_JOIN,
				room: this,
			}

			var returnedVal = await messageCollection.insertOne(messageObj);
			messageObj._id = returnedVal.insertedId;

			this.messages.push(messageObj);
			this.userIds.push(user._id);
			return messageObj;
		},
		removeUser: async function (messageCollection, user) {
			var messageObj = {
				message: user.name + " has left.",
				user: user,
				date: getDate(),
				type: MessageType.USER_LEFT,
				room: this
			}

			var returnedVal = await messageCollection.insertOne(messageObj);
			messageObj._id = returnedVal.insertedId;

			this.messages.push(messageObj);
			this.userIds.splice(this.getUserIndex(user), 1);
			return messageObj;
		},
		addMessage: async function (messageCollection, message, user) {
			var messageObj = {
				message: message,
				sender: user.name,
				date: getDate(),
				type: MessageType.USER_MESSAGE,
				room_id: this._id
			}

			var returnedVal = await messageCollection.insertOne(messageObj);
			messageObj._id = returnedVal.insertedId;
			this.messages.push(messageObj);
			return messageObj;
		},
		getUserIndex: function (user) {
			for (var i = 0; i < this.userIds.length; i++) {
				if (this.userIds[i] == user._id) {
					return i;
				}
			}
			return -1;
		},
		loadMessages: function (messagesCollection) {
			return messagesCollection.find({ room_id: this._id }).toArray();
		}
	};
}
