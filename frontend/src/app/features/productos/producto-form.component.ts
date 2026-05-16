import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormInputComponent } from '../../shared/form/form-input.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormMultiSelectComponent } from '../../shared/form/form-multiselect.component';
import { ProductoService } from '../../core/services/producto.service';
import { LoteService } from '../../core/services/lote.service';
import { Proveedor } from '../../core/models/proveedor.model';
import { Lote } from '../../core/models/lote.model';
import { BaseComponent } from '../../core/base/base.component';

@Component({
  selector: 'app-producto-form',
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
        icon="fa-solid fa-boxes-stacked">

        @if (esEdicion && !modoEdicion) {
          <button toolbar type="button" (click)="activarEdicion()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                   text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
        } @else if (esEdicion && modoEdicion) {
          <div toolbar class="flex gap-2">
            <button type="button" (click)="onSubmit()"
              [disabled]="productoForm.invalid"
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
            @for (_ of [1,2,3,4,5,6]; track $index) {
              <div class="h-14 bg-gray-100 rounded-xl"></div>
            }
          </div>
        } @else {

        <form [formGroup]="productoForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Información del Producto
            </p>
          </div>

          <app-form-input
            label="Nombre"
            icon="fa-solid fa-tag"
            placeholder="Ej: Pasta de avellana"
            [required]="true"
            [control]="getControl('nombre')" />

          <app-form-input
            label="Precio (€)"
            type="number"
            icon="fa-solid fa-euro-sign"
            placeholder="0.00"
            [required]="true"
            [control]="getControl('precio')" />

          <app-form-multi-select
            label="Tipo de Producto"
            [single]="true"
            [options]="tipoProductos"
            [control]="getControl('tipoProducto')"
            (onOpen)="cargarTipoProductos()" />

          <app-form-input
            label="Stock Mínimo"
            type="number"
            icon="fa-solid fa-triangle-exclamation"
            placeholder="0"
            [required]="true"
            [control]="getControl('stockMinimo')" />

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Proveedor
            </p>
          </div>

          <app-form-multi-select
            class="md:col-span-2"
            label="Proveedor"
            [single]="true"
            [showSearch]="true"
            [options]="proveedoresNombres"
            [control]="getControl('proveedor')"
            (onOpen)="cargarProveedores()" />

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Envase y Unidad de Medida
            </p>
          </div>

          <app-form-multi-select
            label="Tipo de Envase"
            [single]="true"
            [options]="envases"
            [control]="getControl('envase')"
            (onOpen)="cargarEnvases()" />

          <app-form-input
            label="Contenido por Envase"
            type="number"
            icon="fa-solid fa-weight-hanging"
            placeholder="Ej: 3"
            [required]="true"
            [control]="getControl('contenidoPorUnidad')" />

          <app-form-multi-select
            class="md:col-span-2"
            label="Unidad de Medida"
            [single]="true"
            [options]="unidadesMedida"
            [control]="getControl('unidadMedida')"
            (onOpen)="cargarUnidadesMedida()" />

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
                        <p class="text-[11px] text-slate-400">Entrada: {{ formatFecha(lote.fechaEntrada) }}</p>
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
            text="Registrar Producto"
            iconClass="fa-solid fa-boxes-stacked"
            [disabled]="productoForm.invalid"
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
export class ProductoFormComponent extends BaseComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private http            = inject(HttpClient);
  private productoService = inject(ProductoService);
  private loteService     = inject(LoteService);
  private route           = inject(ActivatedRoute);

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

  proveedores:        Proveedor[] = [];
  proveedoresNombres: string[]    = [];
  unidadesMedida:     string[]    = [];
  envases:            string[]    = [];
  tipoProductos:      string[]    = [];

  get tituloHeader(): string {
    if (!this.esEdicion) return 'Nuevo Producto';
    return this.modoEdicion ? 'Editar Producto' : 'Detalles del Producto';
  }
  get subtituloHeader(): string {
    if (!this.esEdicion) return 'Formulario para registrar un nuevo producto';
    return this.modoEdicion ? 'Modifica los datos del producto' : 'Información del producto';
  }

  productoForm: FormGroup = this.fb.group({
    nombre:             ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    precio:             ['', [Validators.required, Validators.min(0)]],
    tipoProducto:       ['', [Validators.required]],
    stockMinimo:        ['', [Validators.required, Validators.min(0)]],
    envase:             ['', [Validators.required]],
    contenidoPorUnidad: ['', [Validators.required, Validators.min(0.001)]],
    unidadMedida:       ['', [Validators.required]],
    proveedor:          ['', [Validators.required]],
  });

  ngOnInit() {
    if (this.esEdicion) {
      this.productoService.getById(this.id!).subscribe({
        next: (p) => {
          this.productoForm.patchValue({
            nombre:             p.nombre,
            precio:             p.precio,
            tipoProducto:       p.tipoProducto,
            stockMinimo:        p.stockMinimo,
            envase:             p.envase,
            contenidoPorUnidad: p.contenidoPorUnidad,
            unidadMedida:       p.unidadMedida,
            proveedor:          p.proveedor?.nombre ?? '',
          });
          if (p.proveedor) {
            this.proveedores = [p.proveedor];
            this.proveedoresNombres = [p.proveedor.nombre];
          }
          this.productoForm.disable();
          this.cargando = false;
          this.cargarLotes();
        },
        error: () => {
          this.notif.error('No se pudo cargar el producto', 'Error');
          this.router.navigate(['/almacen/gestion']);
        }
      });
    }
  }

  cargarLotes() {
    this.loteService.getByEntidad('PRODUCTO', this.id!).subscribe({
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
      tipoEntidad:    'PRODUCTO',
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
    this.valoresOriginales = this.productoForm.getRawValue();
    this.modoEdicion = true;
    this.productoForm.enable();
  }

  cancelarEdicion() {
    this.productoForm.patchValue(this.valoresOriginales);
    this.productoForm.disable();
    this.modoEdicion = false;
  }

  onSubmit() {
    if (this.productoForm.invalid) { this.productoForm.markAllAsTouched(); return; }
    const val = this.productoForm.getRawValue();
    const proveedorObj = this.proveedores.find(p => p.nombre === val.proveedor);
    const data = {
      nombre:             val.nombre,
      precio:             val.precio,
      tipoProducto:       val.tipoProducto,
      envase:             val.envase,
      contenidoPorUnidad: val.contenidoPorUnidad,
      stockMinimo:        val.stockMinimo,
      unidadMedida:       val.unidadMedida,
      proveedor:          proveedorObj ? { id: proveedorObj.id } : null,
      ...(this.esEdicion ? {} : { stockActual: 0 }),
    };

    const peticion = this.esEdicion
      ? this.productoService.update(this.id!, data as any)
      : this.productoService.create(data as any);

    peticion.subscribe({
      next: () => {
        this.notif.success(
          this.esEdicion ? 'Producto actualizado correctamente' : 'Producto registrado correctamente',
          'Producto'
        );
        if (this.esEdicion) {
          this.productoForm.disable();
          this.modoEdicion = false;
        } else {
          this.productoForm.reset();
        }
      },
      error: (err) => this.notif.error(
        err.error?.message || (this.esEdicion ? 'Error al actualizar el producto' : 'Error al registrar el producto'),
        'Error'
      )
    });
  }

  onCancel() {
    this.notif.info('Formulario limpiado correctamente', 'Info');
    this.productoForm.reset();
  }

  cargarProveedores() {
    if (this.proveedores.length > 0) return;
    this.http.get<Proveedor[]>('/api/proveedores').subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresNombres = data.map(p => p.nombre);
      },
      error: () => this.notif.error('Error al cargar los proveedores', 'Error')
    });
  }

  cargarUnidadesMedida() {
    if (this.unidadesMedida.length > 0) return;
    this.http.get<string[]>('/api/productos/unidadesMedida').subscribe({
      next: (data) => this.unidadesMedida = data,
      error: () => this.notif.error('Error al cargar las unidades de medida', 'Error')
    });
  }

  cargarEnvases() {
    if (this.envases.length > 0) return;
    this.http.get<string[]>('/api/productos/envases').subscribe({
      next: (data) => this.envases = data,
      error: () => this.notif.error('Error al cargar los envases', 'Error')
    });
  }

  cargarTipoProductos() {
    if (this.tipoProductos.length > 0) return;
    this.http.get<string[]>('/api/productos/tipoProductos').subscribe({
      next: (data) => this.tipoProductos = data,
      error: () => this.notif.error('Error al cargar los tipos de producto', 'Error')
    });
  }

  getControl(name: string) {
    return this.productoForm.get(name) as FormControl;
  }
}
