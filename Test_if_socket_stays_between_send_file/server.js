const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/"));
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/page1.html");
});
io.on("connection", function (socket) {
	console.log("connected" + socket.id);
	socket.emit("r", true);
	socket.on("Hello", (mes) => { console.log(mes) });
});

http.listen(8080, () => {
	console.log("listening on " + 8080);
});