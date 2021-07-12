importScripts("./shared.js");

const COMMAND_CHECK_INTERVAL_MS = 1;

function run(commandsUrl) {
    let iterations = 0;
    let nextCommandsCheckTime = performance.now() + COMMAND_CHECK_INTERVAL_MS;
    let stop = false;
    function handleCommand([command, args]) {
        switch (command) {
            case "get-iterations":
                self.postMessage({
                    type: "worker-iterations",
                    count: iterations,
                });
                break;
            case "measure-command-latency":
                self.postMessage({
                    type: "measure-command-latency",
                    infiniteLoopWorkerReceiveTime: measureTime(),
                    ...args
                });
                break;
            case "stop":
                stop = true;
                break;
            default:
                console.error("Unknown command", command);
        }
    }

    while (true) {
        iterations++;

        const now = performance.now();
        if (now >= nextCommandsCheckTime) {
            nextCommandsCheckTime = now + COMMAND_CHECK_INTERVAL_MS;
            try {
                importScripts(commandsUrl + `?t=${now}`);
                const workerCommands = globalThis["workerCommands"] ?? [];
                workerCommands.forEach(handleCommand);
            } catch (err) {
                console.error("Could not import script to get commands", err);
                stop = true;
            }

            if (stop) {
                break;
            }
        }
    }
}

self.addEventListener("message", event => {
    if (event.data.type === "run") {
        run(event.data.commandsUrl);
    }
});
