domMirroring.startReceiving(document.querySelector("iframe"));

if (location.protocol === "file:") {
    var warningNode = document.createElement("p");
    warningNode.className = "file-url-warning";
    warningNode.textContent = "This demo does not work from file:/// URLs, " +
        "please try it over HTTP.";
    document.body.insertBefore(warningNode, document.querySelector("iframe"));
}
