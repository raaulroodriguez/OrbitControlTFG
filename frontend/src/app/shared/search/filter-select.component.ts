import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

export interface FilterOption {
    value: string;
    label: string;
}

@Component({
    selector: 'app-filter-select',
    standalone: true,
    template: `
        <div class="relative">

            <div (click)="open = !open"
                 class="flex items-center gap-3 bg-white border rounded-2xl shadow-sm
                        transition-colors cursor-pointer p-3 min-h-[44px]"
                 [class.border-[var(--primary-400)]]="open"
                 [class.border-gray-200]="!open">

                @if (selected) {
                    <span class="text-sm font-semibold text-slate-700 self-center truncate flex-1">
                        {{ selected.label }}
                    </span>
                } @else {
                    <span class="text-xs sm:text-sm text-slate-400 self-center flex-1">
                        {{ placeholder }}
                    </span>
                }

                <i class="fa-solid fa-chevron-down ml-auto self-center text-gray-400 text-xs transition-transform"
                   [class.rotate-180]="open"></i>
            </div>

            @if (open) {
                <div class="fixed inset-0 z-[9998]" (click)="open = false" (touchstart)="open = false"></div>
                <div class="absolute right-0 top-[calc(100%+4px)] z-[9999] min-w-full w-max
                             bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

                    <div class="flex items-center hover:bg-[var(--primary-50)] transition-colors"
                         [class.bg-[var(--primary-50)]]="!selected">
                        <button type="button"
                                (mousedown)="$event.preventDefault()"
                                (click)="seleccionar(null)"
                                class="flex-1 text-left px-4 py-2.5 text-sm whitespace-nowrap italic text-slate-400
                                       hover:text-[var(--primary-700)] transition-colors"
                                [class.font-semibold]="!selected">
                            {{ placeholder }}
                        </button>
                    </div>

                    <div class="border-t border-gray-100"></div>

                    @for (opt of options; track opt.value) {
                        <div class="flex items-center hover:bg-[var(--primary-50)] transition-colors"
                             [class.bg-[var(--primary-50)]]="selected?.value === opt.value">
                            <button type="button"
                                    (mousedown)="$event.preventDefault()"
                                    (click)="seleccionar(opt)"
                                    class="flex-1 text-left px-4 py-2.5 text-sm whitespace-nowrap
                                           hover:text-[var(--primary-700)] transition-colors"
                                    [class.font-semibold]="selected?.value === opt.value"
                                    [class.text-[var(--primary-700)]]="selected?.value === opt.value">
                                {{ opt.label }}
                            </button>
                        </div>
                    }
                </div>
            }
        </div>
    `,
    host: { style: 'display: contents' }
})
export class FilterSelectComponent {
    @Input() options:     FilterOption[] = [];
    @Input() placeholder  = 'Filtrar...';
    @Output() valueChange = new EventEmitter<string>();

    open     = false;
    selected: FilterOption | null = null;

    seleccionar(opt: FilterOption | null) {
        this.selected = opt;
        this.open     = false;
        this.valueChange.emit(opt?.value ?? '');
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(e: MouseEvent) {
        if (!(e.target as HTMLElement).closest('app-filter-select')) this.open = false;
    }
}
