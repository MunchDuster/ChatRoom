const fs = require("fs"); //for file i/o
const path = require("path");
const filepath = path.join(__dirname, "/chatlogs.json");
var logs = [];
function addLog(log) {
  logs.push(log);

  fs.writeFile(filepath, JSON.stringify(logs, null, 4), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
}
function loadLogs(c) {
  fs.readFile(filepath, "utf8", function (err, data) {
    if (err) {
      console.log(err);
    }
    if (data != undefined && Array.isArray(data)) {
      console.log("loaded data: " + data);
      logs = data;
    }
  });
}
function getLogs() {
  return logs;
}
module.exports = { loadLogs, addLog, getLogs };
