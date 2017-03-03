framePopup.frameNodes_ = [];

/**
 * @param {Node} callback
 */
framePopup.startReceiving = function(frameNode) {
    if (framePopup.frameNodes_.length == 0) {
        var frameCounter = 0;
        window.addEventListener("message", function(e) {
            if (!framePopup.frameNodes_.indexOf(e.source) == -1) {
                return;
            }
            var message = e.data;
            switch (message.type) {
                case framePopup.Message.OPEN_REQUEST:
                    var frameName = "frame-" + frameCounter++;
                    var frame = document.createElement("iframe");
                    frame.className = "popup";
                    frame.setAttribute("name", frameName);
                    frame.style.top = frameCounter * 10 + "px";
                    frame.style.left = frameCounter * 10 + "px";
                    document.body.appendChild(frame);
                    e.source.postMessage({
                        type: framePopup.Message.OPEN_RESPONSE,
                        frameName: frameName
                    }, "*");
                    break;
            }
        });
    }

    framePopup.frameNodes_.push(frameNode);
};
