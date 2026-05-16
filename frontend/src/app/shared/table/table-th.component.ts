import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
    selector: 'app-th',
    standalone: true,
    host: { style: 'display: contents' },
    template: `<th class="px-6 py-4 text-xs font-semibold text-white uppercase bg-[var(--primary-600)] border border-gray-300" [class.text-center]="center"><ng-content /></th>`
})
export class ThComponent {
    @Input({ transform: booleanAttribute }) center = false;
}
