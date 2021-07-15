//CONTROL VARS
const password = "fishy";
const PORT = process.env.PORT || 8080;

//REQUIREMENTS

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { joinUser, removeUser } = require("./users");
const { loadLogs, addLog, getLogs } = require("./logs");
//chat logs

//CLIENT DATA
app.use(express.static(__dirname + "/Client"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//LOAD SAVED CHAT LOGS
loadLogs();

//MESSAGE TYPE ENUM
const msgType = {
  USER: 0,
  SYSTEM: 1,
};

//FUNCTIONS
function addMsg(msg, msgType, dateTime, user) {
  var obj = {
    msg: msg,
    msgType: msgType,
    dateTime: dateTime,
    user: user,
  };

  addLog(obj);
  return obj;
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

//HANDLE REQUESTS
io.on("connection", function (socket) {
  console.log("connected");
  var username = "";
  socket.emit("room pass", password);
  socket.on("entered room", function (userName, dateTime) {
    username = userName;
    const joinedMessage = addMsg(
      userName + " connected",
      msgType.SYSTEM,
      dateTime
    );
    console.log(joinedMessage);
    socket.emit("ketchup", getLogs());
    socket.broadcast.emit("receive chat", joinedMessage);
  });
  socket.on("changed name", function (newname) {
    chatlogs.forEach();
  });
  socket.on("chat msg", function (msg, dateTime, user) {
    var msg = addMsg(msg, msgType.USER, dateTime, user);
    socket.broadcast.emit("receive chat", msg);
  });
  socket.on("disconnect", function () {
    if (username != "") {
      const leftMessage = addMsg(
        username + " disconnected",
        msgType.SYSTEM,
        getDateTime()
      );
      socket.broadcast.emit("receive chat", leftMessage);
    }
  });
});

//SERVER LISTEN
http.listen(PORT, () => {
  console.log("listening on " + PORT);
});
