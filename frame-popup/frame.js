document.querySelector(".popup").onclick = function() {
    framePopup.open(popupWindow => {
        popupWindow.document.body.style.border = "solid 1px red";
        popupWindow.document.body.style.background = "white";
        popupWindow.document.body.textContent = "Popup";
    });
};

try {
    var willFailIfSandboxed = window.top.document.body;
} catch (err) {
    var titleNode = document.querySelector("h1");
    titleNode.appendChild(document.createElement("br"));
    titleNode.appendChild(document.createTextNode("(Sandboxed)"));
}
