var Mechanism = {
    WkWebViewHandler: 8
};

var pingCount = 0;
function ping(mechanism, startTime) {
    pingCount++;
    switch (mechanism) {
        case Mechanism.WkWebViewHandler:
            window.webkit.messageHandlers.pong.postMessage(startTime);
            break;
    }
}

// Set up a periodic timer to show that timers are not affected by any of the
// communication mechanisms.
var pingCountNode = document.getElementById("ping-count");
setInterval(function() {
    pingCountNode.textContent = pingCount;
}, 1000);
