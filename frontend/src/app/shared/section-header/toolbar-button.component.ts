import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar-button',
  standalone: true,
  imports: [],
  template: `
    <button (click)="route && router.navigate([route])"
      class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
             text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
      <i [class]="icon"></i> {{ text }}
    </button>
  `
})
export class ToolbarButtonComponent {
  @Input() text = '';
  @Input() icon = '';
  @Input() route = '';

  router = inject(Router);
}
