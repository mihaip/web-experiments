/**
 * @param {function(Window): void} callback
 */
framePopup.open = function(callback) {
    var listener = function(e) {
        var message = e.data;
        if (message.type != framePopup.Message.OPEN_RESPONSE) {
            return;
        }
        window.removeEventListener("message", listener);
        var popupWindow = window.open("about:blank", message.frameName);
        setTimeout(callback.bind(null, popupWindow), 0);
    };

    window.addEventListener("message", listener);

    window.top.postMessage({
        type: framePopup.Message.OPEN_REQUEST
    }, "*");
};
