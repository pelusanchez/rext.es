var CACHE_NAME = "rext-v1.02";
var real_cache = 

[
       '/index.html#from=sw',
       '/mobile.html#from=sw',
       '/desktop.html#from=sw',
       '/desktop.build.js',
       '/desktop.style.css',
       '/mobile.build.js',
       '/mobile.style.css',
       '/bg.jpg'
     ];
self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open(CACHE_NAME).then(function(cache) {
     return cache.addAll(real_cache);
   })
 );
});

self.addEventListener('fetch', function(event) {
event.respondWith(
  caches.match(event.request)
    .then(function(response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    }
  )
);
});