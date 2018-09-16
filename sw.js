self.addEventListener('install', function() {
	console.log('serive worker installed');
	caches.open('static')
		.then(function(cache) {
			cache.addAll([
				'/',
				'/index.html',
				'/style.css',
				'/img/icon-96x96.png',
				'/img/icon-144x144.png',
				'/js/TweenMax.min.js',
				'/js/three.js',
				'/js/OrbitControls.js',
				'/js/main.js'
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