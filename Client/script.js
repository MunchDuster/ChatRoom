var socket = io();
var msgType = {
  USER: 0,
  SYSTEM: 1,
};

var fontsize = 20;
var backgroundColor;
var is24hour = false;
var willFilter = true;

var userName;
var passwrd = null;
const container = document.getElementsByClassName("messages")[0];
const textBox = document.getElementById("m");

const nameenter = document.getElementById("nam");
const passenter = document.getElementById("pas");
const remmebox = document.getElementById("remme");
const joindiv = document.getElementsByClassName("joindiv")[0];
const coverdivs = Array.from(document.getElementsByClassName("coverdiv"));

if (localStorage.getItem("remme")) {
  const split = localStorage.getItem("remme").split("$$");
  userName = split[0];
  nameenter.value = split[0];
  passenter.value = split[1];
  remmebox.checked = true;
}

//Join button pressed
document.getElementById("goe").addEventListener("click", () => {
  if (passenter.value == passwrd) {
    onJoined();
  } else {
    ding("wrong password");
  }
});

var curdings = [];

//FUNCTIONS
function onJoined() {
  userName = nameenter.value;

  if (remmebox.checked) {
    localStorage.setItem("remme", nameenter.value + "$$" + passenter.value);
  } else {
    localStorage.removeItem("remme");
  }
  coverdivs.forEach((ele) => {
    Array.from(ele.children).forEach((child) => {
      document.body.insertBefore(child, document.body.lastChild);
    });
    ele.parentNode.removeChild(ele);
  });

  joindiv.parentNode.removeChild(joindiv);
  socket.emit("entered room", userName, getDateTime());
}
function txtinput(inputobj) {
  if (inputobj.inputType == "insertText" && inputobj.data == null)
    sendMsg(trim(textBox.innerText));
}
function trim(msg) {
  var splits = msg.split("\n");
  var newmsg = "";
  for (var i = 0; i < splits.length; i++) {
    if (splits[i] == "") {
      splits[i] = splits[i + 1];
    }
  }
  for (var i = 0; i < splits.length; i++) {
    if (splits[i] != undefined) {
      newmsg += splits[i];
    } else {
      break;
    }
  }
  return newmsg;
}
function ding(msg, cancelmsg) {
  for (var i = 0; i < curdings.length; i++) {
    if (curdings[i].cancelmsg == msg) {
      curdings[i].cancel();
    }
  }
  var div = document.createElement("div");
  div.className = "ding";
  div.innerText = msg;
  var thisding = {
    index: curdings.length,
    hascancelled: false,
    cancelmsg: cancelmsg,
    cancel: function () {
      div.parentNode.removeChild(div);
      this.hascancelled = true;
    },
  };
  document.body.appendChild(div);
  curdings.push(thisding);
  setTimeout(() => {
    if (!thisding.hascancelled) thisding.cancel();
    curdings.splice(thisding.index, 1);
  }, 2000);
}
function readTime(istoday, hr, min, thshr, thsmin) {
  if (istoday) {
    const minutesPassed = (thshr - hr) * 60 + (thsmin - min);
    if (minutesPassed < 1) return ",few seconds ago";
    else if (minutesPassed < 30) return ", " + minutesPassed + " minutes ago";
    else if (minutesPassed >= 30 && minutesPassed < 40)
      return ",half an hour ago";
    else if (minutesPassed < 60) return ",while ago";
    else if (minutesPassed >= 60 && minutesPassed < 120) return "an hour ago ";
    else return ",few hours ago";
  } else {
    hr = !is24hour && hr > 12 ? hr - 12 : hr;
    return " at " + hr + ":" + ("0" + min).slice(-2);
  }
}
const dayMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function showDateTime(date_ob) {
  // adjust 0 before single digit date
  const day = ("0" + date_ob.day).slice(-2);
  const month = ("0" + (date_ob.month + 1)).slice(-2);
  const year = date_ob.year;
  const hours = date_ob.hour;
  const minutes = ("0" + date_ob.minute).slice(-2);

  const now = getDateTime();

  var dayOfYear = date_ob.day;
  for (var i = 0; i < date_ob.month; i++) {
    dayOfYear += dayMonths[i];
  }
  var thisDayOfYear = now.day;
  for (var i = 0; i < now.month; i++) {
    thisDayOfYear += dayMonths[i];
  }

  if (dayOfYear == thisDayOfYear) {
    return (
      "Today " + readTime(true, hours, date_ob.minute, now.hour, now.minute)
    );
  } else if (dayOfYear == thisDayOfYear - 1) {
    return (
      "Yesterday " +
      readTime(false, hours, date_ob.minute, now.hour, now.minute)
    );
  } else {
    return (
      year +
      "-" +
      month +
      "-" +
      day +
      " " +
      readTime(false, hours, date_ob.minute, now.hour, now.minute)
    );
  }
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
  passwrd = pass;
}
function sendMsg(msg) {
  console.log("sending chat msg...");
  socket.emit("chat msg", msg, getDateTime(), userName);

  makeMessage(userName, msg, getDateTime());
  textBox.innerText = "";
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
var lastborder;
function makeMessage(user, msg, dateTime) {
  var newDiv = document.createElement("div");
  newDiv.className = user == userName ? "msgBox my" : "msgBox other";

  var namediv = document.createElement("div");
  namediv.innerText = user == userName ? user + "(You)" : user;
  namediv.innerText += " : " + showDateTime(dateTime);
  namediv.className = "namediv";
  newDiv.appendChild(namediv);

  newDiv.append(willFilter ? filterText(msg) : msg);

  addOnTop(newDiv);
}
function makeSystemMessage(msg, dateTime) {
  var newDiv = document.createElement("div");
  newDiv.className = "system msgBox";
  newDiv.innerText = msg;

  var timediv = document.createElement("div");
  timediv.innerText = showDateTime(dateTime);
  timediv.className = "timediv";

  newDiv.appendChild(timediv);
  addOnTop(newDiv);
}

//SOCKET CONNECTION STUFF
socket.on("room pass", function (pass) {
  getPassword(pass);
});
socket.on("ketchup", function (msgs) {
  msgs.forEach((data) => {
    if (data.msgType == msgType.USER)
      makeMessage(data.user, data.msg, data.dateTime);
    else makeSystemMessage(data.msg, data.dateTime);
  });
});
socket.on("receive chat", function (data) {
  console.log("Incoming message");
  if (data.msgType == msgType.USER)
    makeMessage(data.user, data.msg, data.dateTime);
  else makeSystemMessage(data.msg, data.dateTime);
});
