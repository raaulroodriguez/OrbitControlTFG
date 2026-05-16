importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBX5ny59s5YDph3rYuDnhhAJJBlkfPuVH4",
    authDomain: "orbitcontrol-8508d.firebaseapp.com",
    projectId: "orbitcontrol-8508d",
    storageBucket: "orbitcontrol-8508d.firebasestorage.app",
    messagingSenderId: "390324093622",
    appId: "1:390324093622:web:f68650115b429be34b5c17"
});

const messaging = firebase.messaging();

const icon = '/imgs/logos/iconoSinFondo.png';

messaging.onBackgroundMessage(function(payload) {
    const data = payload.data || {};
    self.registration.showNotification(data.title || 'OrbitControl', {
        body: data.body || '',
        icon,
        badge: icon,
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' }
    });
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(clients.openWindow(url));
});
