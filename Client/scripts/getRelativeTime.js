
function getRelativeTime(utcDate) {

	var now = new Date();
	var relativeDate = utcDate - now.getTimezoneOffset();

	var differenceInMinutes = Math.floor(now.getTime() / 60000) - relativeDate;
	var minutesPassed = differenceInMinutes % 60;
	var hoursPassed = Math.floor(differenceInMinutes / 60) % 60;
	var daysPassed = Math.floor(differenceInMinutes / (60 * 24));

	const appendNonZeros = function (list) {
		var str = '';
		for (var i = 0; i < list.length; i++) {
			if (list[i].value > 0) {
				str += list[i].value + list[i].name;
			}
			if (i < list.length - 1) {
				str += ", ";
			}
		}
		return str;
	}

	/*
	BRIEF
	if was sent less than a minute ago
		return "just now"
	else if was sent less than an hour ago
		return "x minutes ago"
	else if was sent less than 12 hours ago
		return "x hours, y minutes ago"
	else if was sent less than 7 days ago
		return "x days, y hours ago"
	else
		return relativeDate
	*/

	if (daysPassed <= 0) {
		if (hoursPassed <= 0) {
			if (minutesPassed <= 0) {
				return "Just now";
			} else {
				return minutesPassed + 'mins ago';
			}
		} else {
			return appendNonZeros([{ value: hoursPassed, name: 'hrs' }, { value: minutesPassed, name: 'mins' }]) + ' ago';
		}
	}
	else {
		return appendNonZeros([{ value: daysPassed, name: 'days' }, { value: hoursPassed, name: 'hours' }]) + ' ago';
	}
}