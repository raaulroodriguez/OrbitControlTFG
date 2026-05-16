import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormInputComponent } from '../../../shared/form/form-input.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { FormMultiSelectComponent } from '../../../shared/form/form-multiselect.component';
import { HeladoService } from '../../../core/services/helado.service';
import { RecetaService } from '../../../core/services/receta.service';
import { LoteService } from '../../../core/services/lote.service';
import { Helado, Receta } from '../../../core/models/helado.model';
import { Lote } from '../../../core/models/lote.model';
import { BaseComponent } from '../../../core/base/base.component';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-helado-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    FormInputComponent,
    SectionHeaderComponent,
    ButtonComponent,
    FormMultiSelectComponent,
    DecimalPipe,
  ],
  template: `
    <app-section-header
        [title]="tituloHeader"
        [subtitle]="subtituloHeader"
        icon="fa-solid fa-ice-cream">

        @if (esEdicion && !modoEdicion) {
          <button toolbar type="button" (click)="activarEdicion()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                   text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
        } @else if (esEdicion && modoEdicion) {
          <div toolbar class="flex gap-2">
            <button type="button" (click)="onSubmit()"
              [disabled]="heladoForm.invalid"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                     text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
            </button>
            <button type="button" (click)="cancelarEdicion()"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                     text-[var(--primary-600)] bg-white/70 hover:bg-white transition-colors shadow-sm active:scale-95">
              <i class="fa-solid fa-xmark"></i> Cancelar
            </button>
          </div>
        }
    </app-section-header>

    <div class="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden text-[var(--primary-600)] mt-4">
      <div class="p-4 sm:p-7">

        @if (cargando) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-pulse">
            @for (_ of [1,2,3,4]; track $index) {
              <div class="h-14 bg-gray-100 rounded-xl"></div>
            }
          </div>
        } @else {

        <form [formGroup]="heladoForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Información del Helado
            </p>
          </div>

          <app-form-input
            label="Nombre"
            icon="fa-solid fa-ice-cream"
            placeholder="Ej: Vainilla"
            [required]="true"
            [control]="getControl('nombre')" />

          <app-form-multi-select
            label="Tipo"
            [single]="true"
            [options]="tiposHelado"
            [control]="getControl('tipo')" />

          <app-form-input
            label="Stock Mínimo"
            type="number"
            icon="fa-solid fa-triangle-exclamation"
            placeholder="0"
            [required]="true"
            [control]="getControl('stockMinimo')" />

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Receta
            </p>
          </div>

          <app-form-multi-select
            class="md:col-span-2"
            label="Receta"
            [single]="true"
            [showSearch]="true"
            [options]="recetasNombres"
            [control]="getControl('receta')"
            (onOpen)="cargarRecetas()" />

        </form>

        }

      </div>

      <!-- Lotes (solo en edición) -->
      @if (esEdicion && !cargando) {
        <div class="px-4 sm:px-7 pb-6 border-t border-gray-100 mt-2 pt-6">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Lotes en almacén ({{ lotes().length }})
            </p>
            <button (click)="toggleNuevoLote()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                     bg-[var(--primary-50)] text-[var(--primary-600)] hover:bg-[var(--primary-100)] transition-colors">
              <i class="fa-solid fa-plus text-[10px]"></i> Añadir lote
            </button>
          </div>

          @if (mostrarNuevoLote()) {
            <div class="mb-3 p-3 rounded-xl border border-[var(--primary-100)] bg-[var(--primary-50)] flex flex-col gap-2">
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                  <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Cantidad</label>
                  <input type="number" min="0" step="0.1"
                    [(ngModel)]="nuevoLoteCantidad" [ngModelOptions]="{standalone: true}"
                    placeholder="0"
                    class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"/>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Caducidad</label>
                  <input type="date"
                    [(ngModel)]="nuevoLoteFecha" [ngModelOptions]="{standalone: true}"
                    class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"/>
                </div>
              </div>
              <textarea [(ngModel)]="nuevoLoteObs" [ngModelOptions]="{standalone: true}"
                rows="2" placeholder="Observaciones (opcional)"
                class="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)] resize-none"></textarea>
              <div class="flex gap-2 justify-end">
                <button (click)="guardarNuevoLote()" [disabled]="guardandoLote()"
                  class="px-4 py-1.5 rounded-xl bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white text-xs font-bold
                         transition-colors flex items-center gap-1.5 disabled:opacity-60">
                  @if (guardandoLote()) { <i class="fa-solid fa-spinner fa-spin text-xs"></i> }
                  Guardar
                </button>
                <button (click)="toggleNuevoLote()"
                  class="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          }

          @if (lotes().length === 0) {
            <p class="text-sm text-slate-400 text-center py-4">Sin lotes registrados</p>
          } @else {
            <div class="flex flex-col gap-2">
              @for (lote of lotes(); track lote.id) {
                <div class="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <div class="flex items-center gap-2.5">
                    <i class="fa-solid fa-layer-group text-[var(--primary-400)] text-xs"></i>
                    <div>
                      <p class="text-sm font-semibold text-slate-700">{{ lote.cantidad | number:'1.0-2' }} ud</p>
                      @if (lote.fechaEntrada) {
                        <p class="text-[11px] text-slate-400">
                          Entrada: {{ formatFecha(lote.fechaEntrada) }}
                        </p>
                      }
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    @if (lote.fechaCaducidad) {
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        [class]="caducidadClase(lote.fechaCaducidad)">
                        Cad: {{ formatFecha(lote.fechaCaducidad) }}
                      </span>
                    } @else {
                      <span class="text-[11px] text-slate-400">Sin caducidad</span>
                    }
                    <button (click)="eliminarLote(lote.id!)"
                      class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (!esEdicion) {
        <div class="px-4 py-4 sm:px-8 sm:py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <app-button
            text="Registrar Helado"
            iconClass="fa-solid fa-ice-cream"
            [disabled]="heladoForm.invalid"
            (click)="onSubmit()"
            bgColor="bg-[var(--primary-600)]"
            hoverBgColor="hover:bg-[var(--primary-700)]" />
          <app-button
            text="Limpiar Formulario"
            bgColor="bg-white"
            contentColor="text-slate-500"
            hoverBgColor="hover:bg-gray-50"
            (click)="onCancel()" />
        </div>
      }
    </div>
  `
})
export class HeladoFormComponent extends BaseComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private heladoService = inject(HeladoService);
  private recetaService = inject(RecetaService);
  private loteService   = inject(LoteService);
  private route         = inject(ActivatedRoute);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly esEdicion       = !!this.idParam;
  private readonly id      = this.idParam ? +this.idParam : null;
  private valoresOriginales: any = null;

  cargando    = this.esEdicion;
  modoEdicion = false;

  lotes            = signal<Lote[]>([]);
  mostrarNuevoLote = signal(false);
  guardandoLote    = signal(false);
  nuevoLoteCantidad = 0;
  nuevoLoteFecha    = '';
  nuevoLoteObs      = '';

  recetas:       Receta[] = [];
  recetasNombres: string[] = [];
  readonly tiposHelado = ['BARQUETA', 'PALETA'];

  get tituloHeader(): string {
    if (!this.esEdicion) return 'Nuevo Helado';
    return this.modoEdicion ? 'Editar Helado' : 'Detalles del Helado';
  }
  get subtituloHeader(): string {
    if (!this.esEdicion) return 'Formulario para registrar un nuevo helado';
    return this.modoEdicion ? 'Modifica los datos del helado' : 'Información del helado';
  }

  heladoForm: FormGroup = this.fb.group({
    nombre:     ['', [Validators.required, Validators.minLength(2)]],
    tipo:       ['', [Validators.required]],
    stockMinimo: ['', [Validators.required, Validators.min(0)]],
    receta:     ['', [Validators.required]],
  });

  ngOnInit() {
    if (this.esEdicion) {
      this.heladoService.getById(this.id!).subscribe({
        next: (h) => {
          if (h.receta) {
            this.recetas = [h.receta];
            this.recetasNombres = [h.receta.nombre];
          }
          this.heladoForm.patchValue({
            nombre:      h.nombre,
            tipo:        h.tipo,
            stockMinimo: h.stockMinimo,
            receta:      h.receta?.nombre ?? '',
          });
          this.heladoForm.disable();
          this.cargando = false;
          this.cargarLotes();
        },
        error: () => {
          this.notif.error('No se pudo cargar el helado', 'Error');
          this.router.navigate(['/obrador/stock']);
        }
      });
    }
  }

  cargarLotes() {
    this.loteService.getByEntidad('HELADO', this.id!).subscribe({
      next: lotes => this.lotes.set(lotes),
      error: () => {}
    });
  }

  toggleNuevoLote() {
    this.mostrarNuevoLote.update(v => !v);
    this.nuevoLoteCantidad = 0;
    this.nuevoLoteFecha    = '';
    this.nuevoLoteObs      = '';
  }

  guardarNuevoLote() {
    this.guardandoLote.set(true);
    this.loteService.create({
      tipoEntidad:    'HELADO',
      entidadId:      this.id!,
      cantidad:       this.nuevoLoteCantidad,
      fechaCaducidad: this.nuevoLoteFecha ? this.nuevoLoteFecha + 'T00:00:00' : undefined,
      fechaEntrada:   new Date().toISOString().slice(0, 19),
      observaciones:  this.nuevoLoteObs || undefined,
    }).subscribe({
      next: lote => {
        this.lotes.update(l => [...l, lote]);
        this.guardandoLote.set(false);
        this.mostrarNuevoLote.set(false);
        this.notif.success('Lote registrado', 'Lotes');
      },
      error: () => { this.notif.error('Error al guardar el lote', 'Error'); this.guardandoLote.set(false); }
    });
  }

  eliminarLote(id: number) {
    this.loteService.delete(id).subscribe({
      next: () => {
        this.lotes.update(l => l.filter(x => x.id !== id));
        this.notif.info('Lote eliminado', 'Lotes');
      },
      error: () => this.notif.error('Error al eliminar el lote', 'Error')
    });
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  caducidadClase(fecha: string): string {
    const dias = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
    if (dias < 0)   return 'bg-red-100 text-red-700';
    if (dias <= 7)  return 'bg-orange-100 text-orange-700';
    if (dias <= 30) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  }

  activarEdicion() {
    this.valoresOriginales = this.heladoForm.getRawValue();
    this.modoEdicion = true;
    this.heladoForm.enable();
  }

  cancelarEdicion() {
    this.heladoForm.patchValue(this.valoresOriginales);
    this.heladoForm.disable();
    this.modoEdicion = false;
  }

  onSubmit() {
    if (this.heladoForm.invalid) { this.heladoForm.markAllAsTouched(); return; }
    const val = this.heladoForm.getRawValue();
    const recetaObj = this.recetas.find(r => r.nombre === val.receta);
    const data = {
      nombre:      val.nombre,
      tipo:        val.tipo,
      stockMinimo: val.stockMinimo,
      receta:      recetaObj ? { id: recetaObj.id } : null,
    };

    const peticion = this.esEdicion
      ? this.heladoService.update(this.id!, data as any)
      : this.heladoService.create(data as any);

    peticion.subscribe({
      next: () => {
        this.notif.success(
          this.esEdicion ? 'Helado actualizado correctamente' : 'Helado registrado correctamente',
          'Helado'
        );
        if (this.esEdicion) {
          this.heladoForm.disable();
          this.modoEdicion = false;
        } else {
          this.heladoForm.reset();
        }
      },
      error: (err) => this.notif.error(
        err.error?.message || (this.esEdicion ? 'Error al actualizar el helado' : 'Error al registrar el helado'),
        'Error'
      )
    });
  }

  onCancel() {
    this.notif.info('Formulario limpiado correctamente', 'Info');
    this.heladoForm.reset();
  }

  cargarRecetas() {
    if (this.recetas.length > 0) return;
    this.recetaService.getByTipo('HELADO').subscribe({
      next: (data) => {
        this.recetas = data;
        this.recetasNombres = data.map(r => r.nombre);
      },
      error: () => this.notif.error('Error al cargar las recetas', 'Error')
    });
  }

  getControl(name: string) {
    return this.heladoForm.get(name) as FormControl;
  }
}
