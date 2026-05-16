import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <div class="bg-[var(--primary-600)] px-4 py-3">
        <ng-content select="[card-header]" />
      </div>

      <div class="px-4 py-2 flex flex-col divide-y divide-gray-50">
        <ng-content />
      </div>

      @if (showActions) {
        <div class="px-4 py-3 bg-[var(--primary-600)] flex items-center justify-center gap-2">
          <ng-content select="[card-actions]" />
        </div>
      }

    </div>
  `
})
export class CardComponent {
  @Input() showActions = true;
}
