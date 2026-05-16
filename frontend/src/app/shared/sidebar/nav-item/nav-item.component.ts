import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  template: `
    <button (click)="toggle.emit()"
      class="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-gray-200 hover:bg-[var(--primary-500)] hover:text-white transition-colors text-sm font-medium">
      <i [class]="icon"></i>
      {{ text }}
      <i class="fa-solid fa-angle-down ml-auto transition-transform duration-200"
         [class.rotate-180]="isOpen"></i>
    </button>
  `
})
export class NavItemComponent {
  @Input() icon   = '';
  @Input() text   = '';
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();
}
