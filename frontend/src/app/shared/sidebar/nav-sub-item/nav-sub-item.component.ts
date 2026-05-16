import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-sub-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a [routerLink]="route" routerLinkActive="bg-[var(--primary-800)] text-[var(--gray-100)]"
       class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-[var(--primary-500)] hover:text-white transition-colors text-xs font-medium">
      <i [class]="icon"></i> {{ text }}
    </a>
  `
})
export class NavSubItemComponent {
  @Input() icon  = '';
  @Input() text  = '';
  @Input() route = '';
}
