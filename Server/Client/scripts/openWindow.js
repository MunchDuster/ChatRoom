var prevCoverSettings;
const coverEle = document.querySelector('.Cover');
var currentWindow;

function openWindow(windowEle) {
	currentWindow = windowEle;
	console.log('opening');
	prevCoverSettings = coverEle.style;

	coverEle.style.filter = 'blur(10px)';
	coverEle.style.pointerEvents = 'none';
	coverEle.style.userSelect = 'none';

	windowEle.style.display = 'inline-block';
}
function closeCurrentWindow() {
	coverEle.style = prevCoverSettings;
	currentWindow.style.display = 'none';
}