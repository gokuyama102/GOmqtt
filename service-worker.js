let cacheName = "GOmqttV0.007"; // 👈 any unique name

let filesToCache = [
  "/GOmqtt/", // 👈 your repository name , both slash are important
  "js/service-worker.js",
  "js/mqtt.js",
  "js/UIcontrols.js",
  "images/icons-192.png",
  "images/icons-512.png",
  "css/style.css",
  "css/forms.css",
  "manifest.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("installed successfully");
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("clean-cache")) {
    caches.delete(cacheName);
    console.log("Cache cleared");
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        console.log("served form cache");
      } else {
        console.log("Not serving from cache ", event.request.url);
      }
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== cacheName) {
            console.log("service worker: Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
