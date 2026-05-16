import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3"
         (click)="onClose.emit()">
      <div class="bg-white rounded-2xl w-full flex flex-col max-h-[90vh]"
           [class]="wide ? 'max-w-3xl' : 'max-w-md'"
           (click)="$event.stopPropagation()">

        <div class="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 class="text-base font-bold text-slate-800">{{ title }}</h2>
            @if (subtitle) {
              <p class="text-xs text-slate-400">{{ subtitle }}</p>
            }
          </div>
          <button (click)="onClose.emit()"
                  class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-gray-400"></i>
          </button>
        </div>

        <div class="overflow-y-auto flex-1 px-6">
          <ng-content />
        </div>

        @if (showActions) {
          <div class="flex gap-3 px-6 pt-4 pb-6 shrink-0">
            <button (click)="onClose.emit()"
                    class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button (click)="onSave.emit()"
                    [disabled]="saveDisabled || saving"
                    class="flex-1 py-2.5 rounded-xl bg-[var(--primary-600)] text-white text-sm font-semibold hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              @if (saving) { <i class="fa-solid fa-spinner fa-spin text-xs"></i> }
              {{ saveLabel }}
            </button>
          </div>
        }

      </div>
    </div>
  `
})
export class ModalComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() saveLabel = 'Guardar';
  @Input() saveDisabled = false;
  @Input() saving = false;
  @Input() showActions = true;
  @Input() wide = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave  = new EventEmitter<void>();
}
