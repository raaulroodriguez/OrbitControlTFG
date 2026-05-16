import { Component, EventEmitter, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-search-bar',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <div class="relative flex-1 min-w-48">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input type="text" [formControl]="ctrl" placeholder="Buscar..."
                class="w-full h-11 pl-8 pr-7 text-sm border border-slate-200 rounded-[1.5rem] sm:rounded-[2rem]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] placeholder:text-slate-400 bg-white" />
            @if (ctrl.value) {
                <button type="button" (click)="ctrl.setValue('')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            }
        </div>
    `,
    host: { style: 'display: contents' }
})
export class SearchBarComponent {
    @Output() valueChange = new EventEmitter<string>();

    ctrl = new FormControl('', { nonNullable: true });

    constructor() {
        this.ctrl.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntilDestroyed()
        ).subscribe(v => this.valueChange.emit(v));
    }
}
