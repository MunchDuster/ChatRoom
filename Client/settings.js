const settingsDiv = document.getElementsByClassName("settingsDiv")[0];
function openSettings() {
  settingsDiv.style.display =
    settingsDiv.style.display == "none" ? "inline-block" : "none";
}

const fontsizeSlider = document.getElementById("fntsize");
fontsizeSlider.oninput = function () {
  setFontSizes(fontsizeSlider.value);
};
function setFontSizes(val) {
  Array.from(container.children).forEach((ele) => {
    ele.style.fontSize = val + "px";
    Array.from(ele.children).forEach((elech) => {
      elech.style.fontSize = val * (3 / 5) + "px";
    });
  });
}
const replaces = [
  ["S", "$"],
  ["0", "O"],
];
function filterText(msg) {
  var newmsg = msg;
  for (var i = 0; i < bdwrds.length; i++) {
    for (var rep = 0; rep < replaces.length; rep++) {
      newmsg = newmsg.replace(replaces[rep][1], replaces[rep][0]);
    }
    newmsg = newmsg.toLowerCase();
    newmsg = newmsg.replace(bdwrds[i], "###");
  }
  return newmsg;
}

const backgroundbutton = document.getElementById("background-color");
backgroundbutton.oninput = function () {
  document.getElementsByClassName("background")[0].style.backgroundColor =
    backgroundbutton.value;
};

const invertext = document.getElementById("txtcolor");
invertext.oninput = function () {
  container.style.color = invertext.checked ? "white" : "black";
};
