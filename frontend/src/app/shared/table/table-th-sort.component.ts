import { Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';

@Component({
    selector: 'app-th-sort',
    standalone: true,
    host: { style: 'display: contents' },
    template: `
        <th (click)="sortChange.emit(campo)"
            class="px-6 py-4 text-xs font-semibold text-white uppercase bg-[var(--primary-600)] border border-gray-300 cursor-pointer 
            select-none hover:bg-[var(--primary-700)] transition-colors" [class.text-center]="center">
            <div class="flex items-center gap-1.5">
                <ng-content />
                @if (campoActivo !== campo) {
                    <i class="fa-solid fa-sort text-white/40 text-xs"></i>
                } @else if (dir === 'asc') {
                    <i class="fa-solid fa-sort-up text-white text-xs"></i>
                } @else {
                    <i class="fa-solid fa-sort-down text-white text-xs"></i>
                }
            </div>
        </th>
    `
})

export class ThSortComponent {
    @Input() campo       = '';
    @Input() campoActivo = '';
    @Input() dir: 'asc' | 'desc' = 'asc';
    @Output() sortChange = new EventEmitter<string>();
    @Input({ transform: booleanAttribute }) center = false;
}
