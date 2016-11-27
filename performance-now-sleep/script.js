onload = function() {
    var performanceNowOutputNode = document.querySelector("#performance-now-output");
    var dateNowOutputNode = document.querySelector("#date-now-output");
    var differenceOutputNode = document.querySelector("#difference-output");

    var performanceNowBaseline = performance.now();
    var dateNowBaseline = Date.now();

    var update = function() {
        var performanceNowDelta = performance.now() - performanceNowBaseline;
        var dateNowDelta = Date.now() - dateNowBaseline;
        var difference = Math.abs(performanceNowDelta - dateNowDelta);

        performanceNowOutputNode.textContent = performanceNowDelta.toFixed(0) + "ms";
        dateNowOutputNode.textContent = dateNowDelta.toFixed(0) + "ms";
        differenceOutputNode.textContent = difference.toFixed(0) + "ms";
    };

    setInterval(update, 1000);
    update();
};
