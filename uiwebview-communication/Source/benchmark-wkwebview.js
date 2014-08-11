var Mechanism = {
    WKMessageHandler: 8,
    WKLocationHash: 9,
    WKWebViewExecuteJs: 11
};

var pingCount = 0;
function ping(mechanism, startTime) {
    pingCount++;
    switch (mechanism) {
        case Mechanism.WKMessageHandler:
            window.webkit.messageHandlers.pong.postMessage(startTime);
            break;
        case Mechanism.WKLocationHash:
            location.hash = "#pong://" + startTime;
            break;
        case Mechanism.WKWebViewExecuteJs:
            return startTime;
            break;
    }
}

// Set up a periodic timer to show that timers are not affected by any of the
// communication mechanisms.
var pingCountNode = document.getElementById("ping-count");
setInterval(function() {
    pingCountNode.textContent = pingCount;
}, 1000);
