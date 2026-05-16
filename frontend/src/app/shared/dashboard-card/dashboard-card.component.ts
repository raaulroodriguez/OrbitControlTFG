import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-2xl shadow-md border overflow-hidden flex flex-col h-full" [class]="'border-' + borderColor">
      <div class="p-4 flex-1">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 rounded-xl flex-shrink-0" [class]="iconBg + ' ' + iconColor">
            <i class="text-xl" [class]="iconClass"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800">{{ title }}</h3>
            <p class="text-xs text-gray-500">{{ subtitle }}</p>
          </div>
          <div class="ml-auto">
            <ng-content select="[header-right]" />
          </div>
        </div>
        <hr class="border-gray-200 my-3">
        <ng-content />
      </div>
      <div class="mt-auto bg-gray-50 p-3 border-t border-gray-200">
        <ng-content select="[footer]" />
      </div>
    </div>
  `
})
export class DashboardCardComponent {
  @Input() iconClass   = '';
  @Input() iconBg      = 'bg-gray-50';
  @Input() iconColor   = 'text-gray-600';
  @Input() title       = '';
  @Input() subtitle    = '';
  @Input() borderColor = 'border-gray-100';
}
