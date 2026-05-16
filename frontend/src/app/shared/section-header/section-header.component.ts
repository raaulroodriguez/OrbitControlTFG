import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[var(--primary-600)] rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-xl overflow-hidden w-full">
      <div class="px-5 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          @if (icon) {
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[var(--primary-600)] shadow-md shrink-0">
              <i [class]="icon"></i>
            </div>
          }
          <div>
            <h3 class="font-heading font-bold text-white text-base sm:text-lg leading-tight">{{ title }}</h3>
            <p class="text-[11px] sm:text-xs text-white/60 font-medium">{{ subtitle }}</p>
          </div>
        </div>
        <div class="w-full flex justify-center sm:w-auto sm:justify-start">
          <ng-content select="[toolbar]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class SectionHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
