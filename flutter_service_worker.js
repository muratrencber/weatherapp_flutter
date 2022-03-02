'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "2a6251f62625e9a35be670d1b4c4b93f",
"assets/assets/datas/countries_states.json": "0b2c8093aab9e3537192c028c31d11d8",
"assets/assets/weather_icons/01d@4x.png": "09d40653ace2a8379b4cefd0cc09986d",
"assets/assets/weather_icons/01n@4x.png": "ffd41dea48efc3f184d6d6cc261dcd6a",
"assets/assets/weather_icons/02d@4x.png": "e0854d5e7f0c2ca56140690b989c5313",
"assets/assets/weather_icons/02n@4x.png": "f3c1ab99a496c7c6e67d5d40a8db769c",
"assets/assets/weather_icons/03d@4x.png": "ef465e8a4c80dee76856e7907f35c5b5",
"assets/assets/weather_icons/03n@4x.png": "ef465e8a4c80dee76856e7907f35c5b5",
"assets/assets/weather_icons/04d@4x.png": "515aa358c970ea488eb5b611451dbeaf",
"assets/assets/weather_icons/04n@4x.png": "515aa358c970ea488eb5b611451dbeaf",
"assets/assets/weather_icons/09d@4x.png": "80c432178901462475cd625e0d7d563f",
"assets/assets/weather_icons/09n@4x.png": "80c432178901462475cd625e0d7d563f",
"assets/assets/weather_icons/10d@4x.png": "344b894451aee6aae4063d6dbe35fb40",
"assets/assets/weather_icons/10n@4x.png": "3989abef11c368095e5a8217b498a8e0",
"assets/assets/weather_icons/11d@4x.png": "d4f8869c9b6a948c4fced0cab25b8d2f",
"assets/assets/weather_icons/11n@4x.png": "eb2da3913738d82f2d4998e834f30a2a",
"assets/assets/weather_icons/13d@4x.png": "7821697e2b81f30bd96abae9037d38db",
"assets/assets/weather_icons/13n@4x.png": "7821697e2b81f30bd96abae9037d38db",
"assets/assets/weather_icons/50d@4x.png": "8d766971979ca472cbe64505f8b4c3c9",
"assets/assets/weather_icons/50n@4x.png": "8d766971979ca472cbe64505f8b4c3c9",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/NOTICES": "f28f6325f42127bd58a480e7159da355",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon.png": "75efc58442fb43d8781bae311a708b53",
"icons/Icon-192.png": "9402ca4499909dd714e88d2f68139399",
"icons/Icon-512.png": "5574197a178fcc903ef4907800df0e32",
"icons/Icon-maskable-192.png": "ad13cec8d1ca7af88878ccadd3af0edd",
"icons/Icon-maskable-512.png": "e7952751f12eaf59a50919639d5772e5",
"index.html": "553ff71207ec86c0b034e64b7488fac2",
"/": "553ff71207ec86c0b034e64b7488fac2",
"main.dart.js": "e2fd61622120de5080ffb077fe0239e7",
"manifest.json": "978a319cb83bc9e38126a18985859dc4",
"version.json": "01de62baae0b94c8fe1c988f7510cd85"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
