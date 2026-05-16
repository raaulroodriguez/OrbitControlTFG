import { Injectable, signal } from '@angular/core';

export type NotificacionTipo = 'success' | 'error' | 'warning' | 'info';

export interface Notificacion {
    id:       number;
    mensaje:  string;
    titulo?:  string;
    tipo:     NotificacionTipo;
    visible:  boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
    readonly notificaciones = signal<Notificacion[]>([]);

    private nextId = 0;

    // Añade la notificación con visible=false y al tick siguiente la pone visible=true
    // para que el CSS pille el cambio y ejecute la animación de entrada
    show(mensaje: string, tipo: NotificacionTipo = 'info', titulo?: string, duracion = 3500): void {
        const id = this.nextId++;
        const notif: Notificacion = { id, mensaje, titulo, tipo, visible: false };

        this.notificaciones.update(list => [...list, notif]);

        setTimeout(() => {
            this.notificaciones.update(list =>
                list.map(n => n.id === id ? { ...n, visible: true } : n)
            );
        }, 10);

        setTimeout(() => this.cerrar(id), duracion);
    }

    success(mensaje: string, titulo?: string, duracion?: number): void {
        this.show(mensaje, 'success', titulo, duracion);
    }

    error(mensaje: string, titulo?: string, duracion?: number): void {
        this.show(mensaje, 'error', titulo, duracion);
    }

    warning(mensaje: string, titulo?: string, duracion?: number): void {
        this.show(mensaje, 'warning', titulo, duracion);
    }

    info(mensaje: string, titulo?: string, duracion?: number): void {
        this.show(mensaje, 'info', titulo, duracion);
    }

    // Primero la oculta (dispara animación de salida CSS) y 300ms después la quita del array
    cerrar(id: number): void {
        this.notificaciones.update(list =>
            list.map(n => n.id === id ? { ...n, visible: false } : n)
        );
        setTimeout(() => {
            this.notificaciones.update(list => list.filter(n => n.id !== id));
        }, 300);
    }
}
