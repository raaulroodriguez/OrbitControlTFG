import { Component, Input } from '@angular/core';
import { SectionHeaderComponent } from '../section-header/section-header.component';

@Component({
  selector: 'app-form-container',
  standalone: true,
  imports: [SectionHeaderComponent],
  template: `
    <app-section-header [title]="title" [subtitle]="subtitle" [icon]="icon"/>
    <div class="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden text-[var(--primary-600)] mt-4">
      <div class="p-4 sm:p-7">
        <ng-content></ng-content>
      </div>
      <div class="px-4 py-4 sm:px-8 sm:py-6 border-t border-gray-200 flex justify-end gap-3">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `
})
export class FormContainerComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
