var socket = io();
var msgType = {
  USER: 0,
  SYSTEM: 1,
};

var userName;
/*
if (localStorage.getItem('user name')) {
	userName = localStorage.getItem('user name');
} else {
	userName = prompt('user name');
	localStorage.setItem('user name',userName);
}
 */

const container = document.getElementById("messages");
const textBox = document.getElementById("m");
const curHolder = document.getElementById("stuff");
var hasSignedIn = false;

function showDateTime(date_ob) {
  // adjust 0 before single digit date
  let date = ("0" + date_ob.day).slice(-2);

  // current month
  let month = ("0" + (date_ob.month + 1)).slice(-2);

  // current year
  let year = date_ob.year;
  // current hours
  let hours = date_ob.hour;

  // current minutes
  let minutes = date_ob.minute;
  return (
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    ("0" + (date_ob.minute)).slice(-2)
  );;
}
function getDateTime() {
	var dert = new Date();
	return {
    minute: dert.getMinutes(),
    hour: dert.getHours(),
    day: dert.getDate(),
    month: dert.getMonth(),
    year: dert.getFullYear(),
  };
}
function getPassword(pass) {
	
	var enpass = prompt("password");
	while (!hasSignedIn && enpass != pass) {
		enpass = prompt("password");
	}
	hasSignedIn = true;
	socket.emit("entered room", userName, getDateTime());
}
function sendMsg() {
  console.log("sending chat msg...");
  socket.emit("chat msg", textBox.innerText, getDateTime(), userName);
	
	makeMessage(userName, textBox.innerText, getDateTime());
	textBox.innerText = '';
}
function addOnTop(div) {
  //Move all messages down
  var moveAmt = div.clientWidth;
  for (var i = 0; i < container.childNodes.length; i++) {
    container.childNodes[i].style.top += moveAmt;
    moveAmt = container.childNodes[i].style.top;
  }
  //Add new message
  div.style.top = 0;
  container.insertBefore(div, container.childNodes[0]);
}
function makeMessage(user, msg, dateTime) {
  var newDiv = document.createElement("div");
  var addOn = "";
  newDiv.className = user == userName ? "msgBox my" : "msgBox other";
  newDiv.innerText =
    user == userName
      ? user + "(You)" + addOn + ": " + msg
      : user + addOn + ": " + msg;
	var timediv = document.createElement('div');
	timediv.innerText = showDateTime(dateTime);
	timediv.className = "timediv";
	newDiv.appendChild(timediv);
  addOnTop(newDiv);
}
function makeSystemMessage(msg, dateTime) {
  var newDiv = document.createElement("div");
  newDiv.className = "msgBox system";
  newDiv.innerText = msg;
	var timediv = document.createElement("div");
  timediv.innerText = showDateTime(dateTime);
  timediv.className = "timediv";
  newDiv.appendChild(timediv);
  addOnTop(newDiv);
}

socket.on('room pass', function (pass) {
	getPassword(pass);
});
socket.on('ketchup', function (msgs) {
	msgs.forEach((data) => {
	
		if (data.msgType == msgType.USER)
      makeMessage(data.user, data.msg, data.dateTime);
    	else makeSystemMessage(data.msg, data.dateTime);
	});
});
socket.on("receive chat", function (data) {
	console.log("Incoming message");
	if (data.msgType == msgType.USER) makeMessage(data.user, data.msg, data.dateTime);
	else  makeSystemMessage(data.msg, data.dateTime);
});