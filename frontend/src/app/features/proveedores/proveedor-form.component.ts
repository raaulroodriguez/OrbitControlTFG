import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormInputComponent } from '../../shared/form/form-input.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormMultiSelectComponent } from '../../shared/form/form-multiselect.component';
import { ProveedorService } from '../../core/services/proveedor.service';
import { BaseComponent } from '../../core/base/base.component';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormInputComponent,
    SectionHeaderComponent,
    ButtonComponent,
    FormMultiSelectComponent
  ],
  template: `
    <app-section-header
        [title]="tituloHeader"
        [subtitle]="subtituloHeader"
        icon="fa-solid fa-truck-medical">

        @if (esEdicion && !modoEdicion) {
          <button toolbar type="button" (click)="activarEdicion()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                   text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
        } @else if (esEdicion && modoEdicion) {
          <div toolbar class="flex gap-2">
            <button type="button" (click)="onSubmit()"
              [disabled]="provForm.invalid"
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

        <form [formGroup]="provForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Datos del Proveedor
            </p>
          </div>

          <app-form-input
            label="Nombre"
            icon="fa-solid fa-dolly"
            placeholder="Ej: Proveedor S.A."
            [required]="true"
            [control]="getControl('nombre')" />

          <app-form-input
            label="NIF (opcional)"
            icon="fa-solid fa-id-card"
            placeholder="Ej: 12345678A"
            [control]="getControl('nif')"
            [errores]="{ pattern: 'El NIF debe tener 8 números y una letra (ej: 12345678A)' }" />

          <app-form-input
            label="Correo Electrónico"
            type="email"
            icon="fa-solid fa-envelope"
            placeholder="proveedor@gmail.com"
            [required]="true"
            [control]="getControl('email')" />

          <app-form-input
            label="Teléfono Móvil"
            type="tel"
            icon="fa-solid fa-phone"
            placeholder="600 00 00 00"
            [required]="true"
            [control]="getControl('telefono')" />

          <app-form-input
            label="Dirección"
            icon="fa-solid fa-home"
            placeholder="Ej: Calle Principal, 123, Ciudad"
            [required]="true"
            [control]="getControl('direccion')" />

          <app-form-multi-select
            class="md:col-span-2"
            label="Tipo de Productos"
            [single]="true"
            [options]="tipoProductos"
            [control]="getControl('tipo_producto')"
            (onOpen)="cargarTipoProductos()" />

        </form>

        }

      </div>

      @if (!esEdicion) {
        <div class="px-4 py-4 sm:px-8 sm:py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <app-button
            text="Registrar Proveedor"
            iconClass="fa-solid fa-truck-medical"
            [disabled]="provForm.invalid"
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
export class ProveedorFormComponent extends BaseComponent implements OnInit {
  private fb               = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private route            = inject(ActivatedRoute);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly esEdicion       = !!this.idParam;
  private readonly id      = this.idParam ? +this.idParam : null;
  private valoresOriginales: any = null;

  cargando     = this.esEdicion;
  modoEdicion  = false;
  tipoProductos: string[] = [];

  get tituloHeader(): string {
    if (!this.esEdicion) return 'Nuevo Proveedor';
    return this.modoEdicion ? 'Editar Proveedor' : 'Detalles del Proveedor';
  }
  get subtituloHeader(): string {
    if (!this.esEdicion) return 'Formulario para registrar un nuevo proveedor';
    return this.modoEdicion ? 'Modifica los datos del proveedor' : 'Información del proveedor';
  }

  provForm: FormGroup = this.fb.group({
    nombre:       ['', [Validators.required, Validators.minLength(2)]],
    nif:          ['', [Validators.pattern(/^(\d{8}[A-Za-z]|[A-Za-z]\d{7}[A-Za-z0-9])$/)]],
    email:        ['', [Validators.required, Validators.email]],
    telefono:     ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    direccion:    ['', [Validators.required, Validators.minLength(5)]],
    tipo_producto: ['', [Validators.required]],
  });

  ngOnInit() {
    this.cargarTipoProductos();
    if (this.esEdicion) {
      this.proveedorService.getById(this.id!).subscribe({
        next: (p) => {
          this.provForm.patchValue({
            nombre:        p.nombre,
            nif:           p.nif,
            email:         p.email,
            telefono:      p.telefono,
            direccion:     p.direccion,
            tipo_producto: p.tipoProducto,
          });
          this.provForm.disable();
          this.cargando = false;
        },
        error: () => {
          this.notif.error('No se pudo cargar el proveedor', 'Error');
          this.router.navigate(['/proveedores/gestion']);
        }
      });
    }
  }

  activarEdicion() {
    this.valoresOriginales = this.provForm.getRawValue();
    this.modoEdicion = true;
    this.provForm.enable();
  }

  cancelarEdicion() {
    this.provForm.patchValue(this.valoresOriginales);
    this.provForm.disable();
    this.modoEdicion = false;
  }

  onSubmit() {
    if (this.provForm.invalid) { this.provForm.markAllAsTouched(); return; }
    const val = this.provForm.getRawValue();
    const data = {
      nombre:       val.nombre,
      nif:          val.nif,
      email:        val.email,
      telefono:     val.telefono,
      direccion:    val.direccion,
      tipoProducto: val.tipo_producto,
    };

    const peticion = this.esEdicion
      ? this.proveedorService.update(this.id!, data as any)
      : this.proveedorService.create(data as any);

    peticion.subscribe({
      next: () => {
        this.notif.success(
          this.esEdicion ? 'Proveedor actualizado correctamente' : 'Proveedor registrado correctamente',
          'Proveedor'
        );
        if (this.esEdicion) {
          this.provForm.disable();
          this.modoEdicion = false;
        } else {
          this.provForm.reset();
        }
      },
      error: (err) => this.notif.error(
        err.error?.message || (this.esEdicion ? 'Error al actualizar el proveedor' : 'Error al registrar el proveedor'),
        'Error'
      )
    });
  }

  onCancel() {
    this.notif.info('Formulario limpiado correctamente', 'Info');
    this.provForm.reset();
  }

  cargarTipoProductos() {
    if (this.tipoProductos.length > 0) return;
    this.proveedorService.getTipoProductos().subscribe({
      next: (data) => this.tipoProductos = data as string[],
      error: () => this.notif.error('Error al cargar los tipos de producto', 'Error')
    });
  }

  getControl(name: string) {
    return this.provForm.get(name) as FormControl;
  }
}
