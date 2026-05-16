import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-multi-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      <label class="text-sm font-bold text-slate-700 font-heading">
        {{ label }}
        @if (required) { <span class="text-error">*</span> }
      </label>

      <div class="relative">
        <div #trigger
          (click)="toggleOpen()"
          class="flex flex-wrap gap-1.5 bg-white border rounded-2xl shadow-sm transition-colors"
          [class]="small ? 'p-1.5 min-h-[32px]' : 'p-3 min-h-[52px]'"
          [class.cursor-pointer]="!control.disabled"
          [class.cursor-not-allowed]="control.disabled"
          [class.opacity-60]="control.disabled"
          [class.bg-gray-50]="control.disabled"
          [class.border-[var(--primary-400)]]="open"
          [class.border-gray-200]="!open">

          @if (showSelected) {
            @for (item of selectedItems; track item) {
              @if (single) {
                <span [class]="small ? 'text-[11px] font-semibold text-slate-700 self-center truncate max-w-full' : 'text-sm font-semibold text-slate-700 self-center'">{{ item }}</span>
              } @else {
                <span class="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--primary-100)]
                             text-[var(--primary-700)] rounded-full font-bold
                             border border-[var(--primary-200)]"
                      [class]="small ? 'text-[10px]' : 'text-xs px-3 py-1'">
                  {{ item }}
                  <button type="button"
                    (click)="$event.stopPropagation(); removeItem(item)"
                    class="hover:text-red-500 transition-colors leading-none">
                    <i class="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </span>
              }
            }
          }

          @if (!showSelected || selectedItems.length === 0) {
            <span class="text-slate-400 self-center" [class]="small ? 'text-[11px]' : 'text-xs sm:text-sm'">
              {{ placeholder || (single ? 'Selecciona...' : 'Selecciona uno o más...') }}
            </span>
          }

          <i class="fa-solid fa-chevron-down ml-auto self-center text-gray-400 transition-transform"
             [class]="small ? 'text-[9px]' : 'text-xs'"
             [class.rotate-180]="open"></i>
        </div>

        @if (open) {
          <div class="fixed inset-0 z-[9998]" (click)="cerrar()" (touchstart)="cerrar()"></div>
          <div class="fixed z-[9999] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
               [style]="dropdownStyle"
               (wheel)="$event.stopPropagation()"
               (touchmove)="$event.stopPropagation()">

            @if (showSearch) {
              <div class="p-2 border-b border-gray-100" (click)="$event.stopPropagation()">
                <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[var(--primary-400)]">
                  <i class="fa-solid fa-magnifying-glass text-gray-400 text-xs shrink-0"></i>
                  <input #searchInput
                    type="text"
                    [value]="searchTerm"
                    (input)="searchTerm = $any($event.target).value"
                    placeholder="Buscar..."
                    class="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400" />
                  @if (searchTerm) {
                    <button type="button" (click)="searchTerm = ''" class="text-gray-400 hover:text-gray-600">
                      <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                  }
                </div>
              </div>
            }

            <div class="overflow-y-auto max-h-48 overscroll-contain">
              @if (groups.length > 0) {
                @for (group of groupsFiltrados; track group.label) {
                    <p class="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[var(--primary-400)]">
                      {{ group.label }}
                    </p>
                    @for (option of group.options; track option) {
                      <button type="button"
                        (mousedown)="$event.preventDefault()"
                        (click)="addItem(option)"
                        class="w-full text-left flex items-center gap-1.5 hover:bg-[var(--primary-50)]
                               hover:text-[var(--primary-700)] transition-colors"
                        [class]="small ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'">
                        <i class="fa-solid fa-circle-plus text-[var(--primary-400)] shrink-0"
                           [class]="small ? 'text-[8px]' : 'text-xs'"></i>
                        {{ option }}
                      </button>
                    }
                }
                @if (groupsFiltrados.length === 0) {
                  <p class="px-4 py-3 text-xs text-slate-400 italic">Sin resultados</p>
                }
              } @else {
                @for (option of filteredOptions; track option) {
                  <div class="flex items-center group hover:bg-[var(--primary-50)] transition-colors"
                       [class.bg-[var(--primary-50)]]="single && selectedItems.includes(option)">
                    <button
                      type="button"
                      (mousedown)="$event.preventDefault()"
                      (click)="addItem(option)"
                      class="flex-1 text-left hover:text-[var(--primary-700)] transition-colors flex items-center gap-1.5"
                      [class]="small ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'"
                      [class.font-semibold]="single && selectedItems.includes(option)">
                      @if (single && selectedItems.includes(option)) {
                        <i class="fa-solid fa-circle-check text-[var(--primary-500)] shrink-0" [class]="small ? 'text-[8px]' : 'text-xs'"></i>
                      } @else {
                        <i class="fa-solid fa-circle-plus text-[var(--primary-400)] shrink-0" [class]="small ? 'text-[8px]' : 'text-xs'"></i>
                      }
                      {{ option }}
                    </button>
                    @if (showOptionActions && !nonActionableOptions.includes(option)) {
                      <div class="flex items-center opacity-70 group-hover:opacity-100 transition-opacity"
                           [class]="small ? 'gap-0 pr-1' : 'gap-0.5 pr-2'">
                        <button type="button"
                                (click)="$event.stopPropagation(); onEditOption.emit(option)"
                                class="rounded-md flex items-center justify-center
                                       hover:bg-[var(--primary-100)] text-[var(--primary-500)] transition-colors"
                                [class]="small ? 'w-5 h-5' : 'w-6 h-6'">
                          <i class="fa-solid fa-pen-to-square" [class]="small ? 'text-[8px]' : 'text-[10px]'"></i>
                        </button>
                        <button type="button"
                                (click)="$event.stopPropagation(); onDeleteOption.emit(option)"
                                class="rounded-md flex items-center justify-center
                                       hover:bg-red-50 text-red-400 transition-colors"
                                [class]="small ? 'w-5 h-5' : 'w-6 h-6'">
                          <i class="fa-solid fa-trash" [class]="small ? 'text-[8px]' : 'text-[10px]'"></i>
                        </button>
                      </div>
                    }
                  </div>
                }
                @if (filteredOptions.length === 0) {
                  <p class="px-4 py-3 text-xs text-slate-400 italic">
                    {{ searchTerm ? 'Sin resultados' : 'Todas las opciones seleccionadas' }}
                  </p>
                }
              }
            </div>
          </div>
        }
      </div>

      @if (control.invalid && control.touched) {
        <span class="text-[11px] font-bold text-red-500 px-1 italic">
          Debe seleccionar al menos una opción
        </span>
      }
    </div>
  `
})
export class FormMultiSelectComponent {
  @Input() label = '';
  @Input() required = false;
  @Input() options: string[] = [];
  @Input() groups: { label: string; options: string[] }[] = [];
  @Input({ required: true }) control!: FormControl;
  @Input() single = false;
  @Input() small = false;
  @Input() placeholder = '';
  @Input() showSearch = false;
  @Input() showOptionActions = false;
  @Input() showSelected = true;
  @Input() nonActionableOptions: string[] = [];
  @Output() onEditOption   = new EventEmitter<string>();
  @Output() onDeleteOption = new EventEmitter<string>();
  @Output() onOpen  = new EventEmitter<void>();
  @Output() onItemAdded   = new EventEmitter<string>();
  @Output() onItemRemoved = new EventEmitter<string>();
  @ViewChild('trigger') triggerRef!: ElementRef;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  open = false;
  dropdownStyle = '';
  searchTerm = '';

  toggleOpen() {
    if (this.control.disabled) return;
    this.open = !this.open;
    if (this.open) {
      this.calcularPosicion();
      this.onOpen.emit();
      if (this.showSearch) setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 50);
    } else {
      this.cerrar();
    }
  }

  cerrar() {
    this.open = false;
    this.searchTerm = '';
  }

  private calcularPosicion() {
    const rect = this.triggerRef.nativeElement.getBoundingClientRect();
    const maxH = 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < maxH + 8 && rect.top > maxH;
    const width = Math.max(rect.width, 180);
    if (openUp) {
      this.dropdownStyle = `bottom:${window.innerHeight - rect.top + 4}px; left:${rect.left}px; width:${width}px`;
    } else {
      this.dropdownStyle = `top:${rect.bottom + 4}px; left:${rect.left}px; width:${width}px`;
    }
  }

  @HostListener('window:scroll', [])
  @HostListener('window:resize', [])
  onWindowChange() {
    if (this.open) this.calcularPosicion();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const el = event.target as HTMLElement;
    if (!el.closest('app-form-multi-select')) this.cerrar();
  }

  get selectedItems(): string[] {
    if (this.single) {
      const v = this.control.value;
      return v ? [v] : [];
    }
    return this.control.value || [];
  }

  get groupsFiltrados(): { label: string; options: string[] }[] {
    return this.groups
      .map(g => ({ label: g.label, options: this.filteredGroupOptions(g.options) }))
      .filter(g => g.options.length > 0);
  }

  get filteredOptions(): string[] {
    const base = this.single
      ? this.options
      : this.options.filter(o => !this.selectedItems.includes(o));
    return this.applySearch(base);
  }

  filteredGroupOptions(options: string[]): string[] {
    const base = options.filter(o => !this.selectedItems.includes(o));
    return this.applySearch(base);
  }

  private applySearch(options: string[]): string[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return options;
    return options.filter(o => o.toLowerCase().includes(term));
  }

  addItem(item: string) {
    if (this.single) {
      this.control.setValue(item);
      this.control.markAsTouched();
      this.cerrar();
      this.onItemAdded.emit(item);
      return;
    }
    if (item && !this.selectedItems.includes(item)) {
      this.control.setValue([...this.selectedItems, item]);
      this.control.markAsTouched();
      this.searchTerm = '';
      if (this.showSearch) this.searchInputRef?.nativeElement?.focus();
    }
    this.onItemAdded.emit(item);
  }

  removeItem(item: string) {
    if (this.control.disabled) return;
    if (this.single) {
      this.control.setValue(null);
      this.onItemRemoved.emit(item);
      return;
    }
    this.control.setValue(this.selectedItems.filter(i => i !== item));
    this.onItemRemoved.emit(item);
  }
}
