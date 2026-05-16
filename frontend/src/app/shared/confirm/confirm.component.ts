import { Component, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
    selector: 'app-confirm',
    standalone: true,
    template: `
        @if (confirm.visible()) {
            <div class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
                 (click)="confirm.cancelar()">
                <div class="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-xl"
                     (click)="$event.stopPropagation()">

                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-triangle-exclamation text-red-500"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-slate-800">
                                {{ confirm.opciones().titulo ?? 'Confirmar acción' }}
                            </h3>
                            <p class="text-sm text-slate-500 mt-0.5">
                                {{ confirm.opciones().mensaje }}
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button (click)="confirm.cancelar()"
                                class="flex-1 py-2.5 rounded-xl border border-gray-200
                                       text-sm font-semibold text-slate-600
                                       hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button (click)="confirm.confirmar()"
                                class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                                       text-white text-sm font-semibold transition-colors">
                            {{ confirm.opciones().etiqueta ?? 'Eliminar' }}
                        </button>
                    </div>

                </div>
            </div>
        }
    `
})
export class ConfirmComponent {
    confirm = inject(ConfirmService);
}
