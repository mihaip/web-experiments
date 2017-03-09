frameGlass.startReceiving(document.querySelector("iframe"));

document.querySelector(".debug-cover-toggle").onchange = function() {
    document.body.classList.toggle("debug-cover");
};

document.querySelectorAll("a").forEach(linkNode => {
    linkNode.onmousedown = e => {
        linkNode.classList.add("mousedown");
    };
    linkNode.onmouseup = e => {
        linkNode.classList.remove("mousedown");
    };
    linkNode.onclick = e => {
        e.preventDefault();
        linkNode.classList.toggle("clicked");
    };
});

if (location.protocol === "file:") {
    var warningNode = document.createElement("p");
    warningNode.className = "file-url-warning";
    warningNode.textContent = "This demo does not work from file:/// URLs, " +
        "please try it over HTTP.";
    document.body.insertBefore(warningNode, document.querySelector("iframe"));
}
