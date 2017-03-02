/**
 * @param {Node} sourceNode
 */
domMirroring.startSending = function(sourceNode) {
    var nodesById = {};
    var idCounter = 0;
    function getHtml() {
        nodesById = {};
        idCounter = 0;

        var mirrorNode = sourceNode.cloneNode(true);
        function inlineStyles(mirrorNode, sourceNode) {
            if (mirrorNode.nodeType != Node.ELEMENT_NODE) {
                return;
            }
            var mirrorId = idCounter++;
            mirrorNode.setAttribute("mirror-id", mirrorId);
            nodesById[mirrorId] = sourceNode;

            // TODO: Only send down styles that are different from the default
            // set.
            var computedStyle = getComputedStyle(sourceNode, null);
            mirrorNode.setAttribute("style", computedStyle.cssText);
            for (var mirrorChildNode = mirrorNode.firstChild,
                        sourceChildNode = sourceNode.firstChild;
                    mirrorChildNode;
                    mirrorChildNode = mirrorChildNode.nextSibling,
                        sourceChildNode = sourceChildNode.nextSibling) {
                inlineStyles(mirrorChildNode, sourceChildNode);
            }
        }
        inlineStyles(mirrorNode, sourceNode);

        // TODO: only send down a whitelisted subset of HTML attributes, to
        // exclude on* event handlers and others that would allow script
        // execution in the host.
        return mirrorNode.outerHTML;
    }

    // TODO: hide sourceNode so that we don't have semi-transparent areas
    // superimpose.
    window.top.postMessage({
        type: domMirroring.Message.START,
        html: getHtml()
    }, "*");

    var mutationObserver = new MutationObserver(function() {
        // TODO: send down delta updates instead of the entire HTML using
        // something like https://github.com/rafaelw/mutation-summary/. Would
        // also help with DOM nodes not getting clobbered during updates and
        // thus not getting the full sequence of events (e.g. if a mutation
        // occurs during mouseup then click won't be sent).
        window.top.postMessage({
            type: domMirroring.Message.UPDATE,
            html: getHtml()
        }, "*");
    });
    mutationObserver.observe(sourceNode, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
    });

    window.addEventListener("message", function(e) {
        var message = e.data;
        switch (message.type) {
            case domMirroring.Message.DISPATCH_EVENT:
                var event = document.createEvent("MouseEvent");
                var targetNode = nodesById[message.targetNodeId];
                event.initMouseEvent(
                    message.event.type,
                    true, // bubble
                    true, // cancelable
                    window,
                    message.event.detail,
                    message.event.screenX,
                    message.event.screenY,
                    message.event.clientX,
                    message.event.clientY,
                    message.event.ctrlKey,
                    message.event.altKey,
                    message.event.shiftKey,
                    message.event.metaKey,
                    message.event.button,
                    null); // related target
                targetNode.dispatchEvent(event);
                break;
        }
    });
};
