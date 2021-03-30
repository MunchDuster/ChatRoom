var socket = io();
var msgType = {
  USER: 0,
  SYSTEM: 1,
};

var userName;
var passwrd = null;
const container = document.getElementById("messages");
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


function txtinput(inputobj) {
  if (inputobj.inputType == "insertText" && inputobj.data == null)
    sendMsg(trim(textBox.innerText));
}
function trim(msg) {
  var splits = msg.split("\n");
  console.log(msg);
  console.log(splits);
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

//Join button pressed
document.getElementById("goe").addEventListener("click", () => {
  if (passenter.value == passwrd) {
    userName = nameenter.value;

    if (remmebox.checked) {
      localStorage.setItem("remme", nameenter.value + "$$" + passenter.value);
    } else {
      localStorage.removeItem("remme");
    }
    coverdivs.forEach((ele) => {
      Array.from(ele.children).forEach((child) => {
        document.body.appendChild(child);
      });
      ele.parentNode.removeChild(ele);
    });
	  joindiv.parentNode.removeChild(joindiv);
	  socket.emit("entered room", userName, getDateTime());
	  
  } else {
    ding("wrong password");
  }
});

var curdings = [];
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
    ("0" + date_ob.minute).slice(-2)
  );
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
function makeMessage(user, msg, dateTime) {
  var newDiv = document.createElement("div");
  var addOn = "";
  newDiv.className = user == userName ? "msgBox my" : "msgBox other";
  newDiv.innerText =
    user == userName
      ? user + "(You)" + addOn + ": " + msg
      : user + addOn + ": " + msg;
  var timediv = document.createElement("div");
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
