/** @const */ frameGlass.client = {};

/**
 * @return {boolean}
 */
frameGlass.client.isEnabled = function() {
    return frameGlass.client.isEnabled_;
};

/**
 * @type {boolean}
 * @private
 */
frameGlass.client.isEnabled_ = false;

frameGlass.client.enable = function() {
    frameGlass.client.isEnabled_ = true;
    frameGlass.client.containerNode_ = document.querySelector(".container");
    frameGlass.client.mutationObserver_ = new MutationObserver(
        frameGlass.client.updateHoles_);

    window.addEventListener("message", frameGlass.client.handleMessage_);

    window.top.postMessage({
        type: frameGlass.Message.ENABLE,
    }, "*");
};



/**
 * @param {!Node} node
 */
frameGlass.client.addPopupNode = function(node) {
    if (frameGlass.client.popups_.some(popup => popup.node === node)) {
        return;
    }
    var mutationObserver = new MutationObserver(
        frameGlass.client.updateHoles_);
    frameGlass.client.popups_.push({
        node: node,
        mutationObserver: mutationObserver
    });
    mutationObserver.observe(node, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
    });
    frameGlass.client.updateHoles_();
};

/**
 * @param {!Node} node
 */
frameGlass.client.removePopupNode = function(node) {
    var index = frameGlass.client.popups_.findIndex(
        popup => popup.node === node);
    if (index != -1) {
        var popup = frameGlass.client.popups_[index];
        popup.mutationObserver.disconnect();
        frameGlass.client.popups_.splice(index, 1);
        frameGlass.client.updateHoles_();
    }
};

/**
 * @type {!Array<{node: !Node: mutationObserver: !MutationObserver}>}
 * @private
 */
frameGlass.client.popups_ = [];

/**
 * @param {boolean=} noPostMessage
 */
frameGlass.client.disable = function(noNotifyHost) {
    frameGlass.client.isEnabled_ = false;

    frameGlass.client.popups_.forEach(
        popup => popup.mutationObserver.disconnect());
    frameGlass.client.popups_ = [];

    frameGlass.client.containerNode_.style.removeProperty("top");
    frameGlass.client.containerNode_.style.removeProperty("left");
    frameGlass.client.containerNode_.style.removeProperty("width");
    frameGlass.client.containerNode_.style.removeProperty("height");

    window.removeEventListener("message", frameGlass.client.handleMessage_);

    if (!noNotifyHost) {
        window.top.postMessage({
            type: frameGlass.Message.DISABLE,
        }, "*");
    }
};

/**
 * @param {!MessageEvent} e
 * @private
 */
frameGlass.client.handleMessage_ = function(e) {
    var message = e.data;
    switch (message.type) {
        case frameGlass.Message.UPDATE_GLASS_MARGIN:
            var containerNode = frameGlass.client.containerNode_;
            containerNode.style.top = message.top + "px";
            containerNode.style.left = message.left + "px";
            containerNode.style.width = message.width + "px";
            containerNode.style.height = message.height + "px";
            frameGlass.client.updateHoles_();
            break;
        case frameGlass.Message.DISABLED:
            frameGlass.client.disable(true);
            break;
    }
};

/**
 * @private
 */
frameGlass.client.updateHoles_ = function() {
    var nodes = frameGlass.client.popups_.map(popup => popup.node)
        .concat(frameGlass.client.containerNode_);
    window.top.postMessage({
        type: frameGlass.Message.UPDATE_HOLES,
        rects: nodes.map(node => node.getBoundingClientRect()).map(rect => ({
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right
        }))
    }, "*");
};
