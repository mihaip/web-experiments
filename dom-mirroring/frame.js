var panelNode = document.querySelector(".panel");
var panelX = 10;
var panelY = 10;
function updatePanel(deltaX, deltaY) {
    panelX += deltaX;
    panelY += deltaY;
    panelNode.style.left = panelX + "px";
    panelNode.style.top = panelY + "px";
}

document.querySelector("button.move.up").onclick =
    updatePanel.bind(null, 0, -10);
document.querySelector("button.move.down").onclick =
    updatePanel.bind(null, 0, 10);
document.querySelector("button.move.left").onclick =
    updatePanel.bind(null, -10, 0);
document.querySelector("button.move.right").onclick =
    updatePanel.bind(null, 10, 0);

document.querySelector(".mirror").onclick = function() {
    domMirroring.startSending(panelNode);
};


var clickMeNode = document.querySelector(".click-me");
var clickMeOutputNode = document.querySelector(".click-me-output");
function showEventType(event) {
    clickMeOutputNode.textContent = "Last Event: " + event.type;
}
["mousedown", "mouseup", "click"].forEach(eventType =>
    clickMeNode.addEventListener(eventType, showEventType))
