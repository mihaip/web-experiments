var Mechanism = {
    LocationHref: 0,
    LinkClick: 1,
    FrameLocationHref: 2,
    FrameSrc: 3,
    FrameLinkClick: 4,
    CookieChange: 5
};

// The link does not need to be appended to the document, that avoids triggering
// any "click" event handlers or invalidating the layout as its "href" attribute
// is changed.
var linkNode = document.createElement("a");

var locationFrame = document.createElement("iframe");
document.body.appendChild(locationFrame);
var linkClickFrame = document.createElement("iframe");
document.body.appendChild(linkClickFrame);
var frameLinkNode = linkClickFrame.contentWindow.document.createElement("a");

var pingCount = 0;
var pongUrl;
function ping(mechanism, startTime) {
    pingCount++;
    pongUrl = "pong://" + startTime;
    switch (mechanism) {
        case Mechanism.LocationHref:
            location.href = pongUrl;
            break;
        case Mechanism.LinkClick:
            linkNode.href = pongUrl;
            linkNode.click();
            break;
        case Mechanism.FrameLocationHref:
            locationFrame.contentWindow.location.href = pongUrl;
            break;
        case Mechanism.FrameSrc:
            locationFrame.src = pongUrl;
            break;
        case Mechanism.FrameLinkClick:
            frameLinkNode.href = pongUrl;
            frameLinkNode.click();
            break;
        case Mechanism.CookieChange:
            document.cookie = "pong=" + startTime;
            break;
    }
}

// Set up a periodic timer to show that timers are not affected by any of the
// communication mechanisms.
var pingCountNode = document.getElementById("ping-count");
setInterval(function() {
    pingCountNode.textContent = pingCount;
}, 1000);
