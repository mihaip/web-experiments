/**
 * @param {Node} callback
 */
frameGlass.startReceiving = function(frameNode) {
    var placeholderNode;
    function enable() {
        var normalFrameBounds = frameNode.getBoundingClientRect();
        placeholderNode = document.createElement("div");
        placeholderNode.className = "frame-placeholder";
        frameNode.parentNode.insertBefore(placeholderNode, frameNode);
        frameNode.classList.add("glass-mode");
        var glassFrameBounds = frameNode.getBoundingClientRect();
        frameNode.contentWindow.postMessage({
            type: frameGlass.Message.UPDATE_GLASS_MARGIN,
            top: normalFrameBounds.top - glassFrameBounds.top,
            left: normalFrameBounds.left - glassFrameBounds.left,
            width: normalFrameBounds.width,
            height: normalFrameBounds.height,
        }, "*");
    }

    function disable() {
        coverNodes.forEach(node => node.classList.add("disabled"));
        placeholderNode.remove();
        frameNode.classList.remove("glass-mode");
    }

    var coverNodes = [];
    function updateHoles(rects) {
        // TODO: delta updates
        coverNodes.forEach(node => node.remove());
        var frameBounds = frameNode.getBoundingClientRect();

        var xValues = [frameBounds.left];
        var yValues = [frameBounds.top];
        rects.forEach(rect => {
            xValues.push(rect.left, rect.right);
            yValues.push(rect.top, rect.bottom);
        });
        xValues.push(frameBounds.right);
        yValues.push(frameBounds.bottom);
        xValues.sort((a, b) => a - b);
        yValues.sort((a, b) => a - b);

        for (var xIndex = 0; xIndex < xValues.length - 1; xIndex++) {
            var left = xValues[xIndex];
            var right = xValues[xIndex + 1];
            for (var yIndex = 0; yIndex < yValues.length - 1; yIndex++) {
                var top = yValues[yIndex];
                var bottom = yValues[yIndex + 1];

                var intersectsRects = rects.some(rect => {
                    let x1 = Math.max(left, rect.left);
                    let x2 = Math.min(right, rect.right);
                    let y1 = Math.max(top, rect.top);
                    let y2 = Math.min(bottom, rect.bottom);
                    return x1 < x2 && y1 < y2;
                });
                if (intersectsRects) {
                    continue;
                }

                var coverNode = document.createElement("div");
                coverNode.className = "cover";
                coverNode.style.top = top + "px";
                coverNode.style.left = left + "px";
                coverNode.style.width = (right - left) + "px";
                coverNode.style.height = (bottom - top) + "px";

                // TODO: can use a single event listener for all cover nodes
                coverNode.addEventListener("mousedown", e => {
                    // Make sure this event doesn't get handled.
                    e.stopPropagation();
                    e.preventDefault();
                    // Disable the glass
                    disable();
                    frameNode.contentWindow.postMessage({
                        type: frameGlass.Message.DISABLED
                    }, "*");
                    // Redispatch the event to the real node under the cover.
                    redispatchEvent(e);
                    // Re-enable pointer events so that we can get mouseup
                    // and click too (and redispatch them). If we leave things
                    // as is, then mouseup will be triggered but "click" will
                    // not.
                    e.target.style.pointerEvents = "all";
                }, {capture: true});
                coverNode.addEventListener("mouseup", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.target.style.pointerEvents = "none";
                    redispatchEvent(e);
                    e.target.style.pointerEvents = "all";
                }, {capture: true});
                coverNode.addEventListener("click", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.target.style.pointerEvents = "none";
                    redispatchEvent(e);
                }, {capture: true});

                document.body.appendChild(coverNode);
                coverNodes.push(coverNode);
            }
        }
    }

    function redispatchEvent(e) {
        var targetNode = document.elementFromPoint(e.clientX, e.clientY);
        var targetEvent = document.createEvent("MouseEvent");
        targetEvent.initMouseEvent(
            e.type,
            true, // bubble
            true, // cancelable
            window,
            e.detail,
            e.screenX,
            e.screenY,
            e.clientX,
            e.clientY,
            e.ctrlKey,
            e.altKey,
            e.shiftKey,
            e.metaKey,
            e.button,
            null); // related target
        targetNode.dispatchEvent(targetEvent);
    }

    window.addEventListener("message", function(e) {
        if (e.source != frameNode.contentWindow) {
            return;
        }
        var message = e.data;
        switch (message.type) {
            case frameGlass.Message.ENABLE:
                enable();
                break;
            case frameGlass.Message.DISABLE:
                disable();
                break;
            case frameGlass.Message.UPDATE_HOLES:
                updateHoles(message.rects);
                break;
        }
    });
};
