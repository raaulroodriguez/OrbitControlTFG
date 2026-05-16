import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-field',
  standalone: true,
  template: `
    <div class="flex items-center justify-between gap-4 py-2.5">
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">{{ label }}</span>
      <div class="text-sm text-right"
      [class]='textColor'>
        <ng-content />
      </div>
    </div>
  `
})
export class CardFieldComponent {
  @Input() label = ''
  @Input() textColor = 'text-slate-700';
}
