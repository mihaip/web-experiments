const MAX_ARRAY_SIZE = 13;

document.querySelector("#test").onclick = e => {
    const jsonString = JSON.stringify(generateJsonData());
    const jsHtml = `<script>handleData(${jsonString});noop();</script>`;
    const inertHtml = `
    <script type="application/json">${jsonString}</script>
    <script>
        const inertNode = document.querySelector("script[type='application/json']");
        const jsonString = inertNode.textContent;
        const jsonData = JSON.parse(jsonString);
        handleData(jsonData);
    </script>`;

    e.target.disabled = true;
    runTests(jsHtml, inertHtml, jsonString.length, () => e.target.disabled = false);
};

function generateJsonData(depth = 0, offset = 0) {
    const maxDepth = parseInt(document.querySelector("#max-depth").value, 10);
    const result = [];
    if (depth == 0) {
        // Ensure that that generated data is different every time, to avoid any
        // caching (the actual value is substitued when generating the request).
        result.push("DATE_PLACEHOLDER");
    } else {
        result.push(null);
    }
    for (let i = 0; i < MAX_ARRAY_SIZE; i++) {
        if (depth == maxDepth) {
            switch ((i + offset) % 3) {
                case 0:
                    result.push(i);
                    break;
                case 1:
                    result.push(i.toString());
                    break;
                case 2:
                    result.push(i % 2 == 0);
                    break;
            }
        } else {
            result.push(generateJsonData(depth + 1, i));
        }
    }
    return result;
};

function runTests(jsHtml, inertHtml, dataSize, completionCallback) {
    const totalRunCount = parseInt(document.querySelector("#runs").value, 10) * 2;
    let currentRunCount = 0;
    let jsTimes = [];
    let inertTimes = [];

    function run() {
        const isJsRun = currentRunCount % 2 == 0;
        const times = isJsRun ? jsTimes : inertTimes;
        runTest(isJsRun ? jsHtml : inertHtml, time => {
            times.push(time);
            currentRunCount++;
            if (currentRunCount == totalRunCount) {
                logRunTimes();
                completionCallback();
            } else {
                // Make sure we yield between iterations.
                setTimeout(run, 10);
            }
        });
    }

    function logRunTimes() {
        log(`${totalRunCount / 2} runs with ${dataSize} bytes of JSON`);
        logTimes(jsTimes, "JSON embedded in JavaScript <script> tag");
        logTimes(inertTimes, "JSON embedded in inert <script> tag");
    }

    function logTimes(times, logModifier) {
        const parseTimes = times.map(time => time.parseTime);
        const totalTimes = times.map(time => time.totalTime);
        const parseTimesMessage = getTimesMessage(parseTimes);
        const totalTimesMessage = getTimesMessage(totalTimes);
        log(`  ${logModifier}`);
        log(`    Parse:  ${parseTimesMessage}`);
        log(`    Total: ${totalTimesMessage}`);
    }

    function getTimesMessage(times) {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        let sum = 0;
        times.forEach(time => {
            min = Math.min(time, min);
            max = Math.max(max, time);
            sum += time;
        });
        const average = sum / times.length;
        let message = `${average.toFixed(1)}ms`;
        if (times.length > 1) {
            message += ` (min: ${min.toFixed(1)}ms, max: ${max.toFixed(1)}ms)`;
        }
        return message;
    }

    setTimeout(run, 10);
}

function runTest(testHtml, callback) {
    const documentHtml = `<!DOCTYPE html>
<html>
    <head>
        <script>
        const startTime = performance.now();
        function handleData(data) {
            window.parent.postMessage({
                /* Reference the data to make sure that it's not considered */
                /* unused or lazily parsed. */
                data: data[0],
                parseTime: performance.now() - startTime
            }, "*");
        }
        function noop() {
          // Dummy function to also call so that JavaScriptCore's JSONP
          // detection doesn't kick in.
        }
        </script>
        ${testHtml.replace('"DATE_PLACEHOLDER"', Date.now())}
    </head>
</html>
`;
    window.onmessage = function(e) {
        const totalTime = performance.now() - startTime;
        const {parseTime} = e.data;
        iframeNode.remove();
        URL.revokeObjectURL(blobUrl);
        window.onmessage = undefined;
        callback({parseTime, totalTime});
    };
    const iframeNode = document.createElement("iframe");
    iframeNode.style.display = "none";
    const startTime = performance.now();

    const blob = new Blob([documentHtml], {type: "text/html"});
    var blobUrl = URL.createObjectURL(blob);
    iframeNode.src = blobUrl;
    document.body.appendChild(iframeNode);
};

function log(message) {
    document.querySelector("#log").appendChild(
        document.createTextNode(message + "\n"));
}
