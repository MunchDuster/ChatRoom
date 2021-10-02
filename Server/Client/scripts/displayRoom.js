function displayRoom(parentTo, roomName, roomDescription, roomLastAccessed, buttonOnclick) {
	const roomDiv = document.createElement('div');

	const roomNameDiv = document.createElement('div');
	const joinNowButton = document.createElement('button');
	const roomDescriptionDiv = document.createElement('div');
	const roomLastAccessedDiv = document.createElement('div');

	roomDiv.classList.add('ListedRoom');

	roomNameDiv.classList.add('ListedRoomName');
	joinNowButton.classList.add('WideButton');
	roomLastAccessedDiv.classList.add('ListedRoomLastAccessed');
	roomDescriptionDiv.classList.add('ListedRoomDescription');

	roomNameDiv.innerText = roomName;
	joinNowButton.innerText = 'Join Now';
	joinNowButton.onclick = buttonOnclick;
	roomLastAccessedDiv.innerText = getRelativeTime(roomLastAccessed);
	roomDescriptionDiv.innerText = roomDescription;

	roomDiv.appendChild(roomNameDiv);
	roomDiv.appendChild(joinNowButton);
	roomDiv.appendChild(roomLastAccessedDiv);
	roomDiv.appendChild(document.createElement('div'));
	roomDiv.appendChild(roomDescriptionDiv);

	parentTo.appendChild(roomDiv);
}