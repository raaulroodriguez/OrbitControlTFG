import { Component, inject } from '@angular/core';
import { NotificationService, Notificacion } from './notification.service';

const CONFIG: Record<string, { icon: string; bg: string; border: string; iconColor: string; titleColor: string }> = {
    success: {
        icon:       'fa-solid fa-circle-check',
        bg:         'bg-white',
        border:     'border-l-4 border-l-green-500',
        iconColor:  'text-green-500',
        titleColor: 'text-green-700',
    },
    error: {
        icon:       'fa-solid fa-circle-xmark',
        bg:         'bg-white',
        border:     'border-l-4 border-l-red-500',
        iconColor:  'text-red-500',
        titleColor: 'text-red-700',
    },
    warning: {
        icon:       'fa-solid fa-triangle-exclamation',
        bg:         'bg-white',
        border:     'border-l-4 border-l-amber-400',
        iconColor:  'text-amber-500',
        titleColor: 'text-amber-700',
    },
    info: {
        icon:       'fa-solid fa-circle-info',
        bg:         'bg-white',
        border:     'border-l-4 border-l-[var(--primary-500)]',
        iconColor:  'text-[var(--primary-500)]',
        titleColor: 'text-[var(--primary-700)]',
    },
};

@Component({
    selector: 'app-notification',
    standalone: true,
    template: `
        <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
            @for (n of notif.notificaciones(); track n.id) {
                <div class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
                            border border-gray-100 transition-all duration-300"
                     [class]="config(n)"
                     [style.opacity]="n.visible ? '1' : '0'"
                     [style.transform]="n.visible ? 'translateY(0)' : 'translateY(-12px)'">

                    <i class="mt-1 text-lg shrink-0" [class]="icon(n)"></i>

                    <div class="flex-1 min-w-0">
                        @if (n.titulo) {
                            <p class="text-xs font-bold uppercase tracking-wide" [class]="titleColor(n)">
                                {{ n.titulo }}
                            </p>
                        }
                        <p class="text-sm text-slate-600 leading-snug">{{ n.mensaje }}</p>
                    </div>

                    <button class="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
                            (click)="notif.cerrar(n.id)">
                        <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>
            }
        </div>
    `
})
export class NotificationComponent {
    notif = inject(NotificationService);

    config(n: Notificacion): string {
        const c = CONFIG[n.tipo];
        return `${c.bg} ${c.border}`;
    }

    icon(n: Notificacion): string {
        const c = CONFIG[n.tipo];
        return `${c.icon} ${c.iconColor}`;
    }

    titleColor(n: Notificacion): string {
        return CONFIG[n.tipo].titleColor;
    }
}
