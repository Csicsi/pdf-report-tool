const CACHE_NAME = "report-tool-cache-v1";
const STATIC_FILES = [
	"../",
	"../index.html",
	"../html/input.html",
	"../html/topics.html",
	"../html/upload.html",
	"../css/base.css",
	"../css/buttons.css",
	"../css/topics.css",
	"/topics.js",
	"/script.js",
	"../icons/icon-128x128.png",
	"../icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_FILES);
		})
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			return cachedResponse || fetch(event.request);
		})
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);
		})
	);
});
