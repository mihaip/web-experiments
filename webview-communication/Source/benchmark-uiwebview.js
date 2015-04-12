var Mechanism = {
    LocationHref: 0,
    LocationHash: 1,
    LocationHashInOut: 2,
    LinkClick: 3,
    FrameSrc: 4,
    XhrSync: 5,
    XhrAsync: 6,
    CookieChange: 7,
    JavaScriptCore: 8,
    UIWebViewExecuteJs: 14
};

// The link does not need to be appended to the document, that avoids triggering
// any "click" event handlers or invalidating the layout as its "href" attribute
// is changed.
var linkNode = document.createElement("a");

var pingCount = 0;
var pongUrl;
var xhr = new XMLHttpRequest();
function ping(mechanism, startTime) {
    pingCount++;
    pongUrl = "pong://" + startTime;
    switch (mechanism) {
        case Mechanism.LocationHref:
            location.href = pongUrl;
            break;
        case Mechanism.LocationHash:
        case Mechanism.LocationHashInOut:
            location.hash = "#" + pongUrl;
            break;
        case Mechanism.LinkClick:
            linkNode.href = pongUrl;
            linkNode.click();
            break;
        case Mechanism.FrameSrc:
            var frame = document.createElement("iframe");
            frame.style.display = "none";
            frame.src = pongUrl;
            document.body.appendChild(frame);
            document.body.removeChild(frame);
            break;
        case Mechanism.CookieChange:
            document.cookie = "pong=" + startTime;
            break;
        case Mechanism.XhrSync:
        case Mechanism.XhrAsync:
            xhr.open("GET", pongUrl, mechanism == Mechanism.XhrAsync);
            xhr.send();
            break;
        case Mechanism.JavaScriptCore:
            viewController.pong(startTime);
            break;
        case Mechanism.UIWebViewExecuteJs:
            return startTime;
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
