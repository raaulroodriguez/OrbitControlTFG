import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyBX5ny59s5YDph3rYuDnhhAJJBlkfPuVH4",
    authDomain: "orbitcontrol-8508d.firebaseapp.com",
    projectId: "orbitcontrol-8508d",
    storageBucket: "orbitcontrol-8508d.firebasestorage.app",
    messagingSenderId: "390324093622",
    appId: "1:390324093622:web:f68650115b429be34b5c17"
};

const VAPID_KEY = 'BG5a3M7XwIgIosmn-KYpqHsmmFwl78NUb_KI6B0cNO7YYfJMa1mYmY7OYmNsSmgdCuxZUPez_zoSFZg7Z50-ivY';
const ICON = '/imgs/logos/iconoSinFondo.png';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {

    private messaging = getMessaging(initializeApp(firebaseConfig));

    constructor(private http: HttpClient) {
        onMessage(this.messaging, async payload => {
            const data = payload.data || {};
            const swReg = await navigator.serviceWorker.ready;
            swReg.showNotification(data['title'] || 'OrbitControl', {
                body: data['body'] || '',
                icon: ICON,
                badge: ICON
            });
        });
    }

    async inicializar(): Promise<void> {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const token = await getToken(this.messaging, { vapidKey: VAPID_KEY });
        if (!token) return;

        const ua = navigator.userAgent;
        const plataforma = /android/i.test(ua) ? 'ANDROID' : /iphone|ipad/i.test(ua) ? 'IOS' : 'WEB';
        await lastValueFrom(this.http.post('/api/notificaciones/token', { token, plataforma }));
    }
}
