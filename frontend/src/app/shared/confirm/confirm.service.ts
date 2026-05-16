import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
    titulo?:  string;
    mensaje:  string;
    etiqueta?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    readonly visible  = signal(false);
    readonly opciones = signal<ConfirmOptions>({ mensaje: '' });

    private resolver?: (value: boolean) => void;

    abrir(opciones: ConfirmOptions | string): Promise<boolean> {
        const opts = typeof opciones === 'string' ? { mensaje: opciones } : opciones;
        this.opciones.set(opts);
        this.visible.set(true);
        return new Promise(resolve => { this.resolver = resolve; });
    }

    confirmar() {
        this.visible.set(false);
        this.resolver?.(true);
    }

    cancelar() {
        this.visible.set(false);
        this.resolver?.(false);
    }
}
