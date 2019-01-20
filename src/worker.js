const _version = "v1";

const _staticFiles = [
    "/",
    "/vue.2.2.55.min.js",
    "/app.js",
    "/styles.css",
    "/app_icon_144.png",
    "/app_icon_192.png",
    "/app_icon_512.png",
    "/backdrop.jpg",
    "/manifest.json"
];

const _offlineApiResponse = {
    timezone: "(No connection)",
    currently: {
        temperature: "0",
        summary: "-"
    },
    daily: {
        data: []
    }
};

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(_version).then(cache => {
        return cache.addAll(_staticFiles);
    }));
});

self.addEventListener("activate", function (event) { });

self.addEventListener("fetch", function (event) {

    if (isApiRequest(event.request)) {
        if (!navigator.onLine) {
            console.log(`WORKER : API : Device is offline - Respond with offline response data!`);
            event.respondWith(new Response(JSON.stringify(_offlineApiResponse), { headers: { "content-type": "application/json" } }));
            return;
        } else {
            console.log(`WORKER : API : Device is online - Grab response from live source!`);
            event.respondWith(fetch(event.request));
            return;
        }
    }

    event.respondWith(fromCache(event.request));
});

function isApiRequest(request) {
    return request.url.indexOf("tiny-weather") > -1;
}

function fromCache(request) {
    return caches.open(_version).then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (matching) {
                console.log(`WORKER: Cache hit for ${request.url}`);
                return matching || Promise.reject('no-match');
            }
            if (navigator.onLine && !matching) {
                // A bit of an odd-ball, but just in case the cache turns up emtpy and we're online...
                console.log(`WORKER: Loading a fresh copy for ${request.url}`);
                return fetch(request);
            }
        });
    });
}