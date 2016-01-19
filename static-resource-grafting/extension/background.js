var GRAFT_URLS = {
    // JS
    "http://persistent.info/web-experiments/static-resource-grafting/site/script.js":
        "http://localhost:8000/grafted/script.js",
    "http://persistent.info/web-experiments/static-resource-grafting/site/styles.css":
        "http://localhost:8000/grafted/styles.css"
};

chrome.webRequest.onBeforeRequest.addListener(
    function(info) {
        var graftedUrl = GRAFT_URLS[info.url];
        if (graftedUrl) {
            return {redirectUrl: graftedUrl};
        }
    },
    {
        urls: Object.keys(GRAFT_URLS)
    },
    ["blocking"]);

chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        var strippedCsp = false;
        for (var i = 0; i < details.responseHeaders.length; i++) {
            var header = details.responseHeaders[i];
            if (header.name.toLowerCase() === "content-security-policy") {
                header.value = '';
                strippedCsp = true;
                break;
            }
        }

        if (strippedCsp) {
            return {responseHeaders: details.responseHeaders};
        }
    },
    {
        types: ["main_frame"],
        urls: [
            "http://persistent.info/web-experiments/static-resource-grafting/*"
        ]
    },
    ["blocking", "responseHeaders"]);


