import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface AlertCardField {
    label: string;
    value: string | number;
    unit?: string;
    color?: 'red' | 'orange' | 'green' | 'slate' | 'blue';
}

@Component({
    selector: 'app-alert-card',
    standalone: true,
    imports: [],
    template: `
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">

            <div class="px-4 py-3 bg-[var(--primary-600)] flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid {{ icono }} text-white text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-white text-sm truncate">{{ nombre }}</p>
                    <span class="text-[11px] text-white/70">{{ subtitulo }}</span>
                </div>
                @if (badge) {
                    <span class="px-2 py-0.5 rounded-full bg-white/25 text-white text-xs font-bold shrink-0">
                        {{ badge }}
                    </span>
                }
            </div>

            <div class="grid divide-x divide-slate-100 py-4"
                 [style.grid-template-columns]="'repeat(' + fields.length + ', minmax(0, 1fr))'">
                @for (f of fields; track f.label) {
                    <div class="flex flex-col items-center gap-0.5 px-2">
                        <p class="text-[11px] text-slate-400 font-medium text-center">{{ f.label }}</p>
                        <p class="text-2xl font-bold" [class]="valueColor(f.color)">{{ f.value }}</p>
                        @if (f.unit) {
                            <p class="text-[11px] text-slate-400">{{ f.unit }}</p>
                        }
                    </div>
                }
            </div>

            <div class="px-4 pb-4 flex gap-2">
                <button type="button"
                    (click)="verDetalle.emit()"
                    class="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold
                           hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                    Ver detalle
                </button>
                <button type="button"
                    (click)="enviarAlerta.emit()"
                    [disabled]="enviando"
                    class="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold
                           transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                    @if (enviando) {
                        <i class="fa-solid fa-spinner fa-spin text-xs"></i>
                    } @else {
                        <i class="fa-solid fa-bell text-xs"></i>
                    }
                    Enviar alerta
                </button>
            </div>

        </div>
    `
})
export class AlertCardComponent {
    @Input() nombre = '';
    @Input() subtitulo = '';
    @Input() icono = 'fa-triangle-exclamation';
    @Input() badge = '';
    @Input() fields: AlertCardField[] = [];
    @Input() enviando = false;

    @Output() verDetalle = new EventEmitter<void>();
    @Output() enviarAlerta = new EventEmitter<void>();

    valueColor(color?: string): string {
        const map: Record<string, string> = {
            red: 'text-red-500',
            orange: 'text-orange-500',
            green: 'text-green-600',
            blue: 'text-blue-500',
            slate: 'text-slate-600',
        };
        return map[color ?? 'slate'] ?? 'text-slate-600';
    }
}
