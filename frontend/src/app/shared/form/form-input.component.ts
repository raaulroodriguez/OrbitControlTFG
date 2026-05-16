import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label) {
        <label [for]="id" class="text-sm font-bold text-slate-700 tracking-tight font-heading">
          {{ label }} @if (required) { <span class="text-error">*</span> }
        </label>
      }

      <div class="relative group">
        @if (icon) {
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary-600)] transition-colors">
            <i [class]="icon"></i>
          </div>
        }

        <input
          [id]="id"
          [type]="type"
          [formControl]="control"
          [placeholder]="placeholder"
          [class.pl-11]="icon"
          class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-body text-sm
                 transition-all duration-200 outline-none
                 focus:border-[var(--primary-400)] focus:ring-4 focus:ring-[var(--primary-100)]
                 disabled:bg-gray-50 disabled:cursor-not-allowed
                 placeholder:text-gray-400 text-slate-700 shadow-sm"
          [class.border-error]="control.invalid && control.touched"
        />
      </div>

      @if (control.invalid && control.touched) {
        <span class="text-[11px] font-bold text-[var(--error)] px-1 flex items-center gap-1">
          <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
        </span>
      }
    </div>
  `
})
export class FormInputComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() icon = '';
  @Input() id = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() required = false;
  @Input({ required: true }) control!: FormControl;
  @Input() errores: Record<string, string> = {};

  get errorMessage(): string {
    const errors = this.control.errors;
    if (!errors) return '';
    const key = Object.keys(errors)[0];
    if (this.errores[key]) return this.errores[key];
    switch (key) {
      case 'required':   return 'Este campo es obligatorio';
      case 'email':      return 'El formato del correo no es válido';
      case 'minlength':  return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      case 'pattern':    return 'El formato introducido no es válido';
      case 'duplicado':  return 'Este nombre de usuario ya está en uso';
      default:           return 'Este campo es inválido';
    }
  }
}