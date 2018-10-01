self.addEventListener('install', function() {
	console.log('serive worker installed');
	caches.open('static')
		.then(function(cache) {
			cache.addAll([
				'/',
				'/Mandala-3D/index.html',
				'/Mandala-3D/style.css',
				'/Mandala-3D/img/icon-96x96.png',
				'/Mandala-3D/img/icon-144x144.png',
				'/Mandala-3D/js/TweenMax.min.js',
				'/Mandala-3D/js/three.js',
				'/Mandala-3D/js/OrbitControls.js',
				'/Mandala-3D/js/main.js'
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
