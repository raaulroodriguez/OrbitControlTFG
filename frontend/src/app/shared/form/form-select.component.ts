import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

export interface SelectOption {
  value: string | number | null;
  label: string;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label) {
        <label class="text-sm font-bold text-slate-700 tracking-tight font-heading">
          {{ label }} @if (required) { <span class="text-error">*</span> }
        </label>
      }

      <div class="relative group">
        @if (icon) {
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary-600)] transition-colors z-10 pointer-events-none">
            <i [class]="icon"></i>
          </div>
        }

        <select
          [formControl]="control"
          [class.pl-11]="icon"
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-body text-sm
                 transition-all duration-200 outline-none appearance-none cursor-pointer
                 focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)]
                 disabled:bg-gray-50 disabled:cursor-not-allowed
                 text-slate-700 shadow-sm"
          [class.border-error]="control.invalid && control.touched">
          @if (placeholder) {
            <option [value]="null">{{ placeholder }}</option>
          }
          @for (opt of options; track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>

        <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <i class="fa-solid fa-chevron-down text-xs"></i>
        </div>
      </div>

      @if (control.invalid && control.touched) {
        <span class="text-[11px] font-bold text-[var(--error)] px-1 flex items-center gap-1">
          <i class="fa-solid fa-circle-exclamation"></i> Este campo es obligatorio o inválido
        </span>
      }
    </div>
  `
})
export class FormSelectComponent {
  @Input() label = '';
  @Input() placeholder = '— Selecciona —';
  @Input() icon = '';
  @Input() required = false;
  @Input() options: SelectOption[] = [];
  @Input({ required: true }) control!: FormControl;
}
