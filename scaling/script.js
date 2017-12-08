const TARGET_WIDTH = 400;

function update() {
    document.querySelector("#target-width-output").textContent = TARGET_WIDTH;
    const displayWidth = document.body.offsetWidth - 30;
    document.querySelector("#display-width-output").textContent = displayWidth;

    updateTransformElement(displayWidth);
    updateZoomElement(displayWidth);
    updateScaledElement(displayWidth);

    document.querySelectorAll(".element").forEach(updateElementMetrics);

    window.requestAnimationFrame(update);
}

function updateTransformElement(displayWidth) {
    const scale = displayWidth / TARGET_WIDTH;
    transformElementNode.style.transform = `scale3d(${scale}, ${scale}, 1)`;
    transformElementNode.style.transformOrigin = "top left";
}

function updateZoomElement(displayWidth) {
    const scale = displayWidth / TARGET_WIDTH;
    zoomElementNode.style.zoom = scale;
}

function updateScaledElement(displayWidth) {
    const scale = value => value * (displayWidth / TARGET_WIDTH);
    var styleNode = scaledElementNode.querySelector("style");
    if (!styleNode) {
        styleNode = document.createElement("style");
        scaledElementNode.appendChild(styleNode);
    }
    scaledElementNode.classList.add("scaled");
    scaledElementNode.style.width = displayWidth + "px";

    styleNode.textContent = `
    .element.scaled {
        padding: ${scale(10)}px;
        border: solid ${scale(1)}px #eee;
    }

    .element.scaled h2 {
        margin: 0 0 ${scale(16)}px 0;
        font-size: ${scale(16)}px;
    }

    .element.scaled p {
        margin: ${scale(16)}px 0;
        font-size: ${scale(12)}px;
    }

    .element.scaled .output {
        font-size: ${scale(10)}px;
    }
`;
}

function updateElementMetrics(elementNode) {
    const titleNode = elementNode.querySelector("h2");
    const paragraphNode = elementNode.querySelector("p");

    elementNode.querySelector(".margin-bottom-output").textContent =
        getComputedStyle(titleNode).marginBottom;
    elementNode.querySelector(".offset-height-output").textContent =
        paragraphNode.offsetHeight;
    elementNode.querySelector(".client-rect-height-output").textContent =
        paragraphNode.getBoundingClientRect().height.toFixed(2);
}

function addScaledElement(label) {
    const templateNode = document.querySelector("#element-template");
    const elementContainerNode = document.importNode(templateNode.content, true)
        .querySelector(".element-container");
        elementContainerNode.querySelector("h3").textContent = label;
    const elementNode = elementContainerNode.querySelector(".element");
    elementNode.style.width = TARGET_WIDTH + "px";
    document.body.appendChild(elementContainerNode);
    return elementNode;
}

const zoomElementNode = addScaledElement("CSS Zoom");
const scaledElementNode = addScaledElement("Scaled Styles");

// Last one so that it doesn't end up overlapping with anything below when
// scaled up.
const transformElementNode = addScaledElement("CSS Transform");

update();

