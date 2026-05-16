import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NfcUpgradeService {
  readonly visible = signal(false);

  private success = new Subject<void>();
  private cancela  = new Subject<void>();

  // El interceptor llama a esto cuando recibe 401 con sesión PIN activa.
  // Devuelve un Observable que completa al autenticarse con NFC, o error si el usuario cancela.
  requestUpgrade(): Observable<void> {
    this.visible.set(true);
    return new Observable(observer => {
      const s = this.success.subscribe(() => { observer.next(); observer.complete(); });
      const c = this.cancela.subscribe(() => { observer.error(new Error('cancelado')); });
      return () => { s.unsubscribe(); c.unsubscribe(); };
    });
  }

  resolve() {
    this.visible.set(false);
    this.success.next();
  }

  cancel() {
    this.visible.set(false);
    this.cancela.next();
  }
}
