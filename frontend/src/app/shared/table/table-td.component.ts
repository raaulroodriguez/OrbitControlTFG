import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-td',
  standalone: true,
  host: { style: 'display: contents' },
  template: `<td class="px-6 py-4 text-slate-700 border-b border-gray-200" [class.text-center]="center"><ng-content /></td>`
})
export class TdComponent {
  @Input({ transform: booleanAttribute }) center = false;
}
