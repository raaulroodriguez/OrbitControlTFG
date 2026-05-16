import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormInputComponent } from '../../../shared/form/form-input.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { FormMultiSelectComponent } from '../../../shared/form/form-multiselect.component';
import { RecetaService } from '../../../core/services/receta.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto, UNIDADES_MEDIDA, UnidadMedida } from '../../../core/models/producto.model';
import { Receta, TipoHelado, TipoReceta } from '../../../core/models/helado.model';
import { BaseComponent } from '../../../core/base/base.component';

interface DetalleIngredienteForm {
  productoId?:    number;
  subrecetaId?:   number;
  nombre:         string;
  unidadBase:     UnidadMedida;
  unidadOriginal: UnidadMedida;
  cantidad:       number;
}

const GRUPOS_UNIDAD: Record<string, UnidadMedida[]> = {
  masa:     ['GRAMO', 'KILOGRAMO'],
  volumen:  ['MILILITRO', 'LITRO'],
  cantidad: ['UNIDAD', 'DOCENA'],
};

@Component({
  selector: 'app-receta-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormInputComponent,
    SectionHeaderComponent,
    ButtonComponent,
    FormMultiSelectComponent,
  ],
  template: `
    <app-section-header
        [title]="tituloHeader"
        [subtitle]="subtituloHeader"
        icon="fa-solid fa-clipboard-list">

        @if (esEdicion && !modoEdicion) {
          <button toolbar type="button" (click)="activarEdicion()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                   text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
        } @else if (esEdicion && modoEdicion) {
          <div toolbar class="flex gap-2">
            <button type="button" (click)="onSubmit()"
              [disabled]="recetaForm.invalid || detallesArray.length === 0"
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

        <form [formGroup]="recetaForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          <div class="md:col-span-2 flex flex-col items-center">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)] mb-2">
              Tipo de Receta
            </p>
            <div class="inline-flex bg-gray-100 rounded-2xl p-1 gap-1">
              @for (tipo of tipos; track tipo.value) {
                <button type="button"
                  (click)="!esEdicion || modoEdicion ? setTipo(tipo.value) : null"
                  class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                  [class]="recetaForm.get('tipoReceta')?.value === tipo.value
                    ? 'bg-white text-[var(--primary-700)] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'"
                  [class.pointer-events-none]="esEdicion && !modoEdicion">
                  <i [class]="tipo.icon"></i>
                  {{ tipo.label }}
                </button>
              }
            </div>
          </div>

          @if (recetaForm.get('tipoReceta')?.value === 'HELADO') {
            <app-form-multi-select
              label="Tipo de Helado"
              placeholder="Selecciona tipo"
              [options]="tiposHeladoOpciones"
              [control]="getControl('tipoHelado')"
              [single]="true"
              [required]="true" />

            <app-form-input
              label="Stock mínimo"
              type="number"
              icon="fa-solid fa-triangle-exclamation"
              placeholder="Ej: 10"
              [required]="true"
              [control]="getControl('stockMinimo')" />
          }

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Información de la Receta
            </p>
          </div>

          <app-form-input
            label="Nombre"
            icon="fa-solid fa-pen-nib"
            placeholder="Ej: Receta Vainilla"
            [required]="true"
            [control]="getControl('nombre')" />

          <app-form-input
            label="Descripción"
            icon="fa-solid fa-align-left"
            placeholder="Sin detalles"
            [control]="getControl('descripcion')" />

          @if (!esEdicion || modoEdicion) {
            <app-form-multi-select
              class="md:col-span-2"
              label="Ingredientes"
              [groups]="grupos"
              [control]="getControl('ingredientes')"
              [showSelected]="false"
              [showSearch]="true"
              (onOpen)="cargarIngredientes()"
              (onItemAdded)="agregarIngrediente($event)" />
          }

          <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" formArrayName="detalles">
            @for (detalle of detallesArray.controls; track $index) {
              <div [formGroupName]="$index"
                   class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div class="flex items-center justify-between px-4 py-2
                            bg-[var(--primary-50)] border-b border-[var(--primary-100)]">
                  <div class="flex items-center gap-2 min-w-0">
                    <i [class]="esBase($index)
                        ? 'fa-solid fa-layer-group text-[var(--primary-400)] text-xs shrink-0'
                        : 'fa-solid fa-flask text-[var(--primary-400)] text-xs shrink-0'">
                    </i>
                    <span class="text-sm font-bold text-[var(--primary-700)] truncate">
                      {{ getDetalleControl($index, 'nombre').value }}
                    </span>
                  </div>
                  @if (!esEdicion || modoEdicion) {
                    <button type="button"
                      (click)="quitarIngrediente($index)"
                      class="flex items-center justify-center w-6 h-6 rounded-lg shrink-0
                             bg-red-50 text-red-400 hover:bg-red-100 transition-colors ml-2">
                      <i class="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  }
                </div>

                <div class="px-4 py-3 flex items-end gap-2">
                  <div class="flex-1">
                    <app-form-input
                      [control]="getDetalleControl($index, 'cantidad')"
                      label="Cantidad"
                      placeholder="Ej: 350"
                      [required]="true" />
                  </div>
                  <div class="mb-[2px]">
                    <select formControlName="unidadOriginal"
                      class="h-[42px] rounded-xl border border-gray-200 bg-gray-50
                             px-3 text-sm font-semibold text-slate-700
                             focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]
                             cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                      @for (u of getUnidadesCompatibles($index); track u.value) {
                        <option [value]="u.value">{{ u.label }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (recetaForm.get('tipoReceta')?.value === 'CASERA' && detallesArray.length > 0) {
            <div class="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl
                        bg-[var(--primary-50)] border border-[var(--primary-200)]">
              <i class="fa-solid fa-scale-balanced text-[var(--primary-500)] text-sm"></i>
              <span class="text-sm text-[var(--primary-700)]">
                Cantidad estimada:
                <span class="font-bold">{{ rendimientoActual.toFixed(2) }} kg/L</span>
              </span>
            </div>
          }

        </form>

        }

      </div>

      @if (!esEdicion) {
        <div class="px-4 py-4 sm:px-8 sm:py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <app-button
            text="Registrar Receta"
            iconClass="fa-solid fa-circle-check"
            [disabled]="recetaForm.invalid || detallesArray.length === 0"
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
export class RecetaFormComponent extends BaseComponent implements OnInit {
  private recetaService   = inject(RecetaService);
  private productoService = inject(ProductoService);
  private fb              = inject(FormBuilder);
  private route           = inject(ActivatedRoute);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly esEdicion       = !!this.idParam;
  private readonly id      = this.idParam ? +this.idParam : null;
  private valoresOriginales: any = null;
  private detallesOriginales: any[] = [];

  cargando    = this.esEdicion;
  modoEdicion = false;

  readonly unidades = UNIDADES_MEDIDA;
  readonly tipos = [
    { value: 'HELADO' as TipoReceta, label: 'Helado', icon: 'fa-solid fa-ice-cream'    },
    { value: 'CASERA' as TipoReceta, label: 'Casera', icon: 'fa-solid fa-mortar-pestle' },
  ];
  readonly tiposHelado = [
    { value: 'BARQUETA' as TipoHelado, label: 'Barqueta' },
    { value: 'PALETA'   as TipoHelado, label: 'Paleta'   },
  ];
  readonly tiposHeladoOpciones = this.tiposHelado.map(t => t.label);

  productosObrador: Producto[] = [];
  basesReceta:      Receta[]   = [];
  grupos: { label: string; options: string[] }[] = [];

  recetaForm = this.fb.group({
    tipoReceta:   ['HELADO' as TipoReceta],
    tipoHelado:   [null as TipoHelado | null],
    nombre:       ['', [Validators.required]],
    descripcion:  [''],
    stockMinimo:  [0],
    ingredientes: [[] as string[], Validators.required],
    detalles:     this.fb.array([])
  });

  get tituloHeader(): string {
    if (!this.esEdicion) return 'Nueva Receta';
    return this.modoEdicion ? 'Editar Receta' : 'Detalles de la Receta';
  }
  get subtituloHeader(): string {
    if (!this.esEdicion) return 'Formulario para registrar una nueva receta';
    return this.modoEdicion ? 'Modifica los datos de la receta' : 'Información de la receta';
  }

  ngOnInit() {
    this.actualizarValidadores('HELADO');
    if (this.esEdicion) {
      this.recetaService.getById(this.id!).subscribe({
        next: (r) => {
          this.recetaForm.patchValue({
            tipoReceta:  r.tipoReceta,
            tipoHelado:  r.tipoHelado
              ? (this.tiposHelado.find(t => t.value === r.tipoHelado)?.label ?? null) as any
              : null,
            nombre:      r.nombre,
            descripcion: r.descripcion,
            stockMinimo: r.stockMinimo ?? 0,
          });
          this.actualizarValidadores(r.tipoReceta);

          // Cargar ingredientes en el FormArray
          this.detallesArray.clear();
          r.ingredientes.forEach(ing => {
            const unidadBase = ing.producto?.unidadMedida ?? 'LITRO';
            this.detallesArray.push(this.fb.group({
              productoId:    [ing.producto?.id ?? null],
              subrecetaId:   [ing.subrecetaId ?? null],
              nombre:        [{ value: ing.producto?.nombre ?? ing.subrecetaNombre ?? '', disabled: true }],
              unidadBase:    [{ value: unidadBase, disabled: true }],
              unidadOriginal:[ing.unidadOriginal ?? unidadBase],
              cantidad:      [ing.cantidadOriginal ?? ing.cantidad, [Validators.required, Validators.min(0.01)]],
            }));
          });

          const nombresIng = r.ingredientes.map(i => i.producto?.nombre ?? i.subrecetaNombre ?? '');
          this.recetaForm.get('ingredientes')?.setValue(nombresIng);

          this.recetaForm.disable();
          this.cargando = false;
        },
        error: () => {
          this.notif.error('No se pudo cargar la receta', 'Error');
          this.router.navigate(['/obrador/recetas']);
        }
      });
    }
  }

  activarEdicion() {
    this.valoresOriginales = {
      tipoReceta:  this.recetaForm.get('tipoReceta')?.value,
      tipoHelado:  this.recetaForm.get('tipoHelado')?.value,
      nombre:      this.recetaForm.get('nombre')?.value,
      descripcion: this.recetaForm.get('descripcion')?.value,
      stockMinimo: this.recetaForm.get('stockMinimo')?.value,
    };
    this.detallesOriginales = this.detallesArray.controls.map(c => ({ ...c.getRawValue() }));
    this.modoEdicion = true;
    this.recetaForm.enable();
    // nombre y unidadBase en cada detalle siempre disabled
    this.detallesArray.controls.forEach(c => {
      c.get('nombre')?.disable();
      c.get('unidadBase')?.disable();
    });
  }

  cancelarEdicion() {
    this.recetaForm.patchValue(this.valoresOriginales);

    this.detallesArray.clear();
    this.detallesOriginales.forEach(d => {
      this.detallesArray.push(this.fb.group({
        productoId:    [d.productoId],
        subrecetaId:   [d.subrecetaId],
        nombre:        [{ value: d.nombre, disabled: true }],
        unidadBase:    [{ value: d.unidadBase, disabled: true }],
        unidadOriginal:[d.unidadOriginal],
        cantidad:      [d.cantidad, [Validators.required, Validators.min(0.01)]],
      }));
    });

    this.recetaForm.disable();
    this.modoEdicion = false;
  }

  private actualizarValidadores(tipo: TipoReceta) {
    const tipoHelado  = this.recetaForm.get('tipoHelado')!;
    const stockMinimo = this.recetaForm.get('stockMinimo')!;
    if (tipo === 'HELADO') {
      tipoHelado.setValidators([Validators.required]);
      stockMinimo.setValidators([Validators.required, Validators.min(1)]);
    } else {
      tipoHelado.clearValidators();
      stockMinimo.clearValidators();
    }
    tipoHelado.updateValueAndValidity();
    stockMinimo.updateValueAndValidity();
  }

  get detallesArray() {
    return this.recetaForm.get('detalles') as FormArray;
  }

  get rendimientoActual(): number {
    const detalles = this.detallesArray.value as DetalleIngredienteForm[];
    const total = detalles
      .filter(d => d.productoId && d.cantidad > 0)
      .reduce((sum, d) => {
        const factor = d.unidadOriginal === 'GRAMO' || d.unidadOriginal === 'MILILITRO' ? 0.001 : 1;
        return sum + d.cantidad * factor;
      }, 0);
    return Math.round(total * 100) / 100;
  }

  getControl(name: string) {
    return this.recetaForm.get(name) as FormControl;
  }

  getDetalleControl(index: number, campo: string): FormControl {
    return this.detallesArray.at(index).get(campo) as FormControl;
  }

  esBase(index: number): boolean {
    return !!this.getDetalleControl(index, 'subrecetaId').value;
  }

  getUnidadesCompatibles(index: number): { value: UnidadMedida; label: string }[] {
    const base = this.getDetalleControl(index, 'unidadBase').value as UnidadMedida;
    const grupo = Object.values(GRUPOS_UNIDAD).find(g => g.includes(base)) ?? [base];
    return grupo.map(u => ({ value: u, label: this.unidades[u].abreviatura }));
  }

  setTipo(tipo: TipoReceta) {
    this.recetaForm.get('tipoReceta')?.setValue(tipo);
    if (tipo === 'CASERA') {
      this.recetaForm.get('tipoHelado')?.setValue(null);
      this.recetaForm.get('stockMinimo')?.setValue(null);
    }
    this.actualizarValidadores(tipo);
  }

  onSubmit() {
    if (this.recetaForm.invalid || this.detallesArray.length === 0) return;
    const formValue = this.recetaForm.getRawValue();

    const payload = {
      nombre:      formValue.nombre as string,
      descripcion: formValue.descripcion || 'Sin detalles',
      activo:      true,
      tipoReceta:  formValue.tipoReceta as TipoReceta,
      tipoHelado:  this.tiposHelado.find(t => t.label === formValue.tipoHelado)?.value ?? null,
      stockMinimo: formValue.tipoReceta === 'HELADO' ? (formValue.stockMinimo ?? 0) : null,
      ingredientes: (formValue.detalles as DetalleIngredienteForm[]).map(d => ({
        ...(d.productoId  ? { producto:  { id: d.productoId  } as Producto } : {}),
        ...(d.subrecetaId ? { subreceta: { id: d.subrecetaId } }             : {}),
        cantidadOriginal: d.cantidad,
        unidadOriginal:   d.unidadOriginal,
      }))
    };

    const peticion = this.esEdicion
      ? this.recetaService.update(this.id!, payload as unknown as Receta)
      : this.recetaService.create(payload as unknown as Receta);

    peticion.subscribe({
      next: () => {
        this.notif.success(
          this.esEdicion ? 'Receta actualizada correctamente' : 'Receta creada correctamente',
          'Receta'
        );
        if (this.esEdicion) {
          this.recetaForm.disable();
          this.modoEdicion = false;
        } else {
          this.detallesArray.clear();
          this.grupos           = [];
          this.productosObrador = [];
          this.basesReceta      = [];
          this.recetaForm.reset({ tipoReceta: 'HELADO', tipoHelado: null, ingredientes: [] });
        }
      },
      error: (err) => this.notif.error(
        err.error?.message || (this.esEdicion ? 'Error al actualizar la receta' : 'Error al crear la receta'),
        'Error'
      )
    });
  }

  onCancel() {
    this.notif.info('Formulario limpiado correctamente', 'Info');
    this.detallesArray.clear();
    this.grupos           = [];
    this.productosObrador = [];
    this.basesReceta      = [];
    this.recetaForm.reset({ tipoReceta: 'HELADO', tipoHelado: null, ingredientes: [] });
  }

  cargarIngredientes() {
    if (this.grupos.length > 0) return;
    forkJoin([
      this.productoService.getAll(),
      this.recetaService.getByTipo('CASERA')
    ]).subscribe({
      next: ([productos, bases]) => {
        this.productosObrador = productos;
        this.basesReceta      = bases;
        this.grupos = [
          { label: 'Productos', options: this.productosObrador.map(p => p.nombre) },
          { label: 'Bases',     options: this.basesReceta.map(b => b.nombre)      },
        ];
      },
      error: () => this.notif.error('Error al cargar los ingredientes', 'Error')
    });
  }

  private unidadPorDefecto(base: UnidadMedida): UnidadMedida {
    const defaults: Partial<Record<UnidadMedida, UnidadMedida>> = {
      'KILOGRAMO': 'GRAMO',
      'LITRO':     'MILILITRO',
      'DOCENA':    'UNIDAD',
    };
    return defaults[base] ?? base;
  }

agregarIngrediente(nombre: string) {
    const producto = this.productosObrador.find(p => p.nombre === nombre);
    if (producto) {
      this.detallesArray.push(this.fb.group({
        productoId:    [producto.id],
        subrecetaId:   [null],
        nombre:        [{ value: producto.nombre,       disabled: true }],
        unidadBase:    [{ value: producto.unidadMedida, disabled: true }],
        unidadOriginal:[this.unidadPorDefecto(producto.unidadMedida)],
        cantidad:      [null, [Validators.required, Validators.min(0.01)]],
      }));
    } else {
      const base = this.basesReceta.find(b => b.nombre === nombre);
      if (!base) return;
      this.detallesArray.push(this.fb.group({
        productoId:    [null],
        subrecetaId:   [base.id],
        nombre:        [{ value: base.nombre, disabled: true }],
        unidadBase:    [{ value: 'LITRO',     disabled: true }],
        unidadOriginal:['MILILITRO'],
        cantidad:      [null, [Validators.required, Validators.min(0.01)]],
      }));
    }
    const seleccionados: string[] = this.getControl('ingredientes').value ?? [];
    this.getControl('ingredientes').setValue([...seleccionados, nombre]);
  }

  quitarIngrediente(index: number) {
    const nombre = this.detallesArray.at(index).get('nombre')?.value;
    this.detallesArray.removeAt(index);
    const seleccionados: string[] = this.getControl('ingredientes').value ?? [];
    this.getControl('ingredientes').setValue(seleccionados.filter((n: string) => n !== nombre));
  }
}
