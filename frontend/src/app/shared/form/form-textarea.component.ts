import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      <label class="text-sm font-bold text-slate-700 font-heading">{{ label }}</label>
      <textarea
        [formControl]="control"
        [placeholder]="placeholder"
        rows="4"
        class="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl font-body text-sm
               transition-all duration-200 outline-none resize-none
               focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)]
               placeholder:text-gray-400 text-slate-700 shadow-sm"
      ></textarea>
    </div>
  `
})
export class FormTextareaComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input({ required: true }) control!: FormControl;
}