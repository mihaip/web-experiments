/**
 * @param {Node} callback
 */
domMirroring.startReceiving = function(frameNode) {
    var mirrorNode;
    window.addEventListener("message", function(e) {
        var message = e.data;
        switch (message.type) {
            case domMirroring.Message.START:
                var mirrorContainerNode = document.createElement("div");
                var frameBounds = frameNode.getBoundingClientRect();
                mirrorContainerNode.style.position = "absolute";
                mirrorContainerNode.style.top = frameBounds.top + "px";
                mirrorContainerNode.style.left = frameBounds.left + "px";
                mirrorContainerNode.style.width = frameBounds.width + "px";
                mirrorContainerNode.style.height = frameBounds.height + "px";
                frameNode.parentNode.appendChild(mirrorContainerNode);
                ["mousedown", "mouseup", "click"].forEach(type =>
                    mirrorContainerNode.addEventListener(type, sendEvent));

                mirrorContainerNode.innerHTML = message.html;
                mirrorNode = mirrorContainerNode.firstChild;
                break;
            case domMirroring.Message.UPDATE:
                var tempContainerNode = document.createElement("div");
                tempContainerNode.innerHTML = message.html;
                var newMirrorNode = tempContainerNode.firstChild;
                mirrorNode.parentNode.replaceChild(newMirrorNode, mirrorNode);
                mirrorNode = newMirrorNode;
                break;
        }
    });

    function sendEvent(event) {
        var targetNodeId = event.target.getAttribute("mirror-id");
        if (!targetNodeId) {
            return;
        }

        var frameBounds = frameNode.getBoundingClientRect();
        frameNode.contentWindow.postMessage({
            type: domMirroring.Message.DISPATCH_EVENT,
            targetNodeId: targetNodeId,
            event: {
                type: event.type,
                detail: event.detail,
                screenX: event.screenX,
                screenY: event.screenY,
                clientX: event.clientX - frameBounds.left,
                clientY: event.clientY - frameBounds.top,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                metaKey: event.metaKey,
                button: event.button
            }
        }, "*");
    }
};
