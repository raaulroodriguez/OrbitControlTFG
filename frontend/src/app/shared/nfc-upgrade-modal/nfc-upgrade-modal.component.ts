import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NfcUpgradeService } from '../../core/services/nfc-upgrade.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-nfc-upgrade-modal',
  standalone: true,
  template: `
    @if (nfc.visible()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="cancelar()"></div>

        <div class="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6
                    animate-in fade-in zoom-in duration-200">

          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[var(--primary-600)] flex items-center justify-center text-white shadow-lg">
                <i class="fa-solid fa-lock text-sm"></i>
              </div>
              <h3 class="font-bold text-slate-800 text-base">Acción restringida</h3>
            </div>
            <button (click)="cancelar()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <p class="text-sm text-slate-500 text-center leading-relaxed">
            Esta acción requiere autenticación con tarjeta.<br>
            El modo <span class="font-semibold text-[var(--primary-600)]">PIN</span> solo permite consultar datos.
          </p>

          <div class="relative flex items-center justify-center w-24 h-24">
            <span class="absolute inline-flex h-full w-full rounded-full bg-[var(--primary-400)] opacity-30 animate-ping"></span>
            <div class="w-20 h-20 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
              <i class="fa-solid fa-wifi text-4xl text-[var(--primary-600)] rotate-90"></i>
            </div>
          </div>

          <div class="text-center">
            <p class="text-sm font-semibold text-slate-700">Esperando tarjeta de acceso...</p>
            <p class="text-xs text-slate-400 mt-1">Acerca tu tarjeta o llavero NFC al lector.</p>
          </div>

          <button (click)="cancelar()"
            class="w-full py-3 rounded-xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
            Cancelar
          </button>
        </div>
      </div>
    }
  `
})
export class NfcUpgradeModalComponent implements OnInit, OnDestroy {
  protected nfc  = inject(NfcUpgradeService);
  private auth   = inject(AuthService);
  private notif  = inject(NotificationService);

  private buffer = '';
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit()    { document.addEventListener('keydown', this.handler); }
  ngOnDestroy() {
    document.removeEventListener('keydown', this.handler);
    if (this.timer) clearTimeout(this.timer);
  }

  private handler = (event: KeyboardEvent): void => {
    if (!this.nfc.visible()) return;

    // Bloqueamos el teclado para que el NFC no escriba en ningún input abierto
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Enter') {
      if (this.buffer.length >= 6) this.autenticar(this.buffer.trim());
      this.buffer = '';
      return;
    }
    if (event.key.length === 1) {
      this.buffer += event.key;
      if (this.timer) clearTimeout(this.timer);
      // Si pasan 150 ms sin más teclas, reseteamos: no es un lector NFC sino el usuario escribiendo
      this.timer = setTimeout(() => { this.buffer = ''; }, 150);
    }
  };

  private autenticar(uid: string) {
    this.auth.loginNfc(uid).subscribe({
      next: () => {
        this.notif.success('Autenticado con tarjeta. Reintentando...', 'Acceso ampliado');
        this.nfc.resolve();
      },
      error: () => this.notif.error('Tarjeta no reconocida. Inténtalo de nuevo.', 'Error NFC')
    });
  }

  cancelar() { this.nfc.cancel(); }
}
