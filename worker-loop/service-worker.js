importScripts("./shared.js");

let workerCommands = [];
let currentFetchResponse = constructResponse([]);

function constructResponse(workerCommands) {
    return new Response(
        `globalThis["workerCommands"] = ${JSON.stringify(workerCommands)};`, {
            status: 200,
            statusText: "OK",
            headers: {
                "Content-Type": "text/javascript",
            }
        });
}

self.addEventListener("message", event => {
    const {data} = event;
    if (data.type === "worker-command") {
        const {command, args} = data;
        if (command === "measure-command-latency") {
            args.serviceWorkerReceiveTime = measureTime();
        }
        workerCommands.push([command, args]);
        currentFetchResponse = constructResponse(workerCommands);
    }
});

self.addEventListener("fetch", event => {
    const requestUrl = new URL(event.request.url);
    if (requestUrl.pathname === "/worker-commands.js") {
        workerCommands = [];
        event.respondWith(currentFetchResponse);
        currentFetchResponse = constructResponse([]);
    }
});

// Boilerplate to make sure we're running as quickly as possible.
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});
