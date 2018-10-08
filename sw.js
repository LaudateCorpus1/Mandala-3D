self.addEventListener('install', function() {
	console.log('serive worker installed');
	caches.open('static')
		.then(function(cache) {
			cache.addAll([
				'/mandala/',
				'/mandala/index.html',
				'/mandala/style.css',
				'/mandala/img/icon-96x96.png',
				'/mandala/img/icon-144x144.png',
				'/mandala/js/TweenMax.min.js',
				'/mandala/js/three.js',
				'/mandala/js/OrbitControls.js',
				'/mandala/js/main.js'
			])
		});
});

self.addEventListener('activate', function() {
	console.log('serive worker ACTIVATED');
});

self.addEventListener('fetch', function(event) {
	console.log('serive worker FETCH');
	event.respondWith(
		caches.match(event.request)
			.then(function(response) {
				if (response) {
					return response;
				} else {
					return fetch(event.request);
				}
			})
	);
});
