document.querySelector("#get-iterations-button").onclick = () => {
    sendWorkerCommand("get-iterations");
}

document.querySelector("#stop-button").onclick = () => {
    sendWorkerCommand("stop");
}

document.querySelector("#measure-command-latency-button").onclick = () => {
    sendWorkerCommand("measure-command-latency", {
        startTime: measureTime(),
    });
};

let currentInfiniteLoopWorker;
let currentServiceWorker;

function sendWorkerCommand(command, args) {
    if (!currentServiceWorker) {
        log("Service worker is not running yet");
        return;
    }
    if (!currentInfiniteLoopWorker) {
        log("Infinite loop worker is not running yet");
        return;
    }
    log(`Sending worker "${command}" command`);
    currentServiceWorker.postMessage({type: "worker-command", command, args});
}

function log(message) {
    console.log(message);
    document.querySelector("#log").appendChild(
        document.createTextNode(message + "\n"));
}

navigator.serviceWorker
    .register("/service-worker.js")
    .then(function(registration) {
        log("Service worker registered");
        if (registration.installing) {
            log("Service worker installing");
            registration.installing.addEventListener(
                "statechange", handleServiceWorkerStateChange);
        } else if(registration.waiting) {
            log("Service worker installed, waiting");
            registration.waiting.addEventListener(
                "statechange", handleServiceWorkerStateChange);
        } else if (registration.active) {
            registration.active.addEventListener(
                "statechange", handleServiceWorkerStateChange);
            log("Service worker active");
            runInfiniteLoop(registration.active);
        }
    }).catch(err => {
        log("Error registering worker: " + err);
    });

function handleServiceWorkerStateChange(event) {
    log(`Service worker stage changed to "${this.state}"`);
    if (this.state === "activated") {
        runInfiniteLoop(this);
    }
}

function runInfiniteLoop(serviceWorker) {
    currentServiceWorker = serviceWorker;
    const infiniteLoopWorker = new Worker("./infinite-loop-worker.js", {name: "infinite-loop"});
    infiniteLoopWorker.addEventListener("message", event => {
        const data = event.data;
        if (data.type === "worker-iterations") {
            log("Got worker iterations: " + data.count);
        } else if (data.type === "measure-command-latency") {
            const endTime = measureTime();
            const {startTime, serviceWorkerReceiveTime, infiniteLoopWorkerReceiveTime} = data;
            const format = (start, end) => `${(end - start).toFixed(2)}ms`;
            log("Latency:");
            log(`  main thread -> service worker: ${format(startTime, serviceWorkerReceiveTime)}`);
            log(`  service worker -> infinite loop worker: ${format(serviceWorkerReceiveTime, infiniteLoopWorkerReceiveTime)}`);
            log(`  infinite loop worker -> main thread: ${format(infiniteLoopWorkerReceiveTime, endTime)}`);
            log(`  total round trip: ${format(startTime, endTime)}`);
        }
    });

    infiniteLoopWorker.postMessage({
        type: "run",
        commandsUrl: "./worker-commands.js",
    });
    log("Infinite loop worker started");
    currentInfiniteLoopWorker = infiniteLoopWorker;

    window.addEventListener("beforeunload", () => {
        // Make sure the infinite loop is stopped, otherwise the tab does not
        // always close.
        sendWorkerCommand("stop");
    });
}
