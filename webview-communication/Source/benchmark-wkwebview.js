var Mechanism = {
    WKMessageHandler: 9,
    WKLocationHash: 10,
    WKLocationHashInOut: 11,
    WKAlert: 12,
    WKPrompt: 13,
    WKWebViewExecuteJs: 15
};

var pingCount = 0;
function ping(mechanism, startTime) {
    pingCount++;
    switch (mechanism) {
        case Mechanism.WKMessageHandler:
            window.webkit.messageHandlers.pong.postMessage(startTime);
            break;
        case Mechanism.WKLocationHash:
        case Mechanism.WKLocationHashInOut:
            location.hash = "#pong://" + startTime;
            break;
        case Mechanism.WKAlert:
            window.alert("pong:" + startTime);
            break;
        case Mechanism.WKPrompt:
            window.prompt("pong:" + startTime);
            break;
        case Mechanism.WKWebViewExecuteJs:
            return startTime;
            break;
    }
}

var kPingHashPrefix = "#ping";
onhashchange = function(e) {
    var hash = location.hash;
    if (hash.lastIndexOf(kPingHashPrefix, 0) == 0) {
        var pingParamsSerialized = decodeURIComponent(hash.substring(kPingHashPrefix.length));
        var pingParams = JSON.parse(pingParamsSerialized);
        ping(pingParams.mechanism, pingParams.startTime);
    }
};

// Set up a periodic timer to show that timers are not affected by any of the
// communication mechanisms.
var pingCountNode = document.getElementById("ping-count");
setInterval(function() {
    pingCountNode.textContent = pingCount;
}, 1000);
