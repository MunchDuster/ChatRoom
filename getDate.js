module.exports = { getDate };
//secondary functions
function getDate() {
	var date = new Date();
	return Math.floor(date.getTime() / 60000) + date.getTimezoneOffset();
}