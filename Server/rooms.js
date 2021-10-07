module.exports = { findRoomByName, findRoomByNameOnly, findRoomById, makeRoom, removeRoom, importRoom };

const { MessageType } = require("./enums");
const { getDate } = require("./getDate.js");

function findRoomByName(roomCollection, roomName, roomPassword) {
	var stuff = roomCollection.find({ name: roomName, password: roomPassword });
	return stuff.toArray();
}
function findRoomByNameOnly(roomCollection, roomName) {
	return roomCollection.find({ name: roomName }).toArray();
}
async function findRoomById(roomCollection, room_id) {
	var allRooms = await roomCollection.find({}).toArray();
	var returnVals = [];
	for (var i = 0; i < allRooms.length; i++) {
		var room = allRooms[i];
		var roomID = room._id;
		var myroomID = room_id;

		if (myroomID.equals(roomID)) {
			returnVals.push(room);
		}
	}
	return returnVals;
}
function importRoom(loadedRoom) {
	var room = makeRoomObj(loadedRoom.name, loadedRoom.password, loadedRoom.description, loadedRoom.ownerId);

	room._id = loadedRoom._id;
	room.messages = loadedRoom.messages;

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
		creationDate: getDate(),

		addUser: async function (messageCollection, user) {
			var messageObj = {
				message: user.name + " has joined.",
				user: user,
				date: getDate(),
				type: MessageType.USER_JOIN,
				roomId: this._id,
			}

			var returnedVal = await messageCollection.insertOne(messageObj).catch(err => {
				console.error(`Error updating message collection on new user joined: ${err}`);
			});
			messageObj._id = returnedVal.insertedId;

			this.userIds.push(user._id);
			return messageObj;
		},
		removeUser: async function (messageCollection, user) {
			var messageObj = {
				message: user.name + " has left.",
				user: user,
				date: getDate(),
				type: MessageType.USER_LEFT,
				roomId: this._id
			}

			var returnedVal = await messageCollection.insertOne(messageObj);
			messageObj._id = returnedVal.insertedId;

			this.userIds.splice(this.getUserIndex(user), 1);
			return messageObj;
		},
		addMessage: async function (messageCollection, message, user) {
			var messageObj = {
				message: message,
				sender: user.name,

				date: getDate(),
				type: MessageType.USER_MESSAGE,
				roomId: this._id
			}

			var returnedVal = await messageCollection.insertOne(messageObj).catch(err => {
				console.error(`Error in room.addMessage updating message collection:\n${err}\nmessageObj:`);
				console.error(messageObj);
			});
			console.log('added message to room.');
			messageObj._id = returnedVal.insertedId;

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
		},
		getTopMessages: async function (messagesCollection, length) {
			var allMessagesinRoom = await messagesCollection.find({ roomId: this._id, type: 4 });
			var allMessagesArr = await allMessagesinRoom.toArray().catch(function (err) {
				console.error(`get top messages error: ${err}`);
			});
			return allMessagesArr.slice(0, length);


		}
	};
}
