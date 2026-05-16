import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-action-button',
  standalone: true,
  template: `
    <button type="button"
      class="flex items-center justify-center transition-colors"
      [class]="bgColor + ' ' + textColor + ' ' + hoverTextColor + ' ' + rounded + ' ' + size">
      <i [class]="iconClass"></i>
    </button>
  `
})
export class ActionButtonComponent {
  @Input() iconClass    = '';
  @Input() bgColor      = 'bg-transparent';
  @Input() textColor    = 'text-slate-400';
  @Input() hoverTextColor = 'hover:text-slate-600';
  @Input() rounded      = 'rounded-lg';
  @Input() size         = 'p-2';
}
