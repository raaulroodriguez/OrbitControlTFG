import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputComponent } from '../../shared/form/form-input.component';
import { FormContainerComponent } from '../../shared/form/form-container.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormMultiSelectComponent } from '../../shared/form/form-multiselect.component';
import { HttpClient } from '@angular/common/http';
import { Producto, TipoProducto } from '../../core/models/producto.model';
import { EventoAlmacenService } from '../../core/services/evento-almacen.service';
import { BaseComponent } from '../../core/base/base.component';

@Component({
    selector: 'app-consumir-producto',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormInputComponent,
        FormContainerComponent,
        ButtonComponent,
        FormMultiSelectComponent
    ],
    template: `
        <app-form-container
        title="Consumir Producto"
        subtitle="Registra el consumo de productos del inventario"
        icon="fa-solid fa-boxes">

            <form [formGroup]="consumirProductoForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                <div class="md:col-span-2">
                    <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                        Tipo de Producto
                    </p>
                </div>

                <!-- Pills multi-selección -->
                <div class="md:col-span-2 flex justify-center">
                    <div class="inline-flex bg-gray-100 rounded-2xl p-1 gap-1">
                        @for (op of tipoOpciones; track op.value) {
                            <button type="button"
                                (click)="toggleTipo(op.value)"
                                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                                [class]="tiposActivos.has(op.value)
                                    ? 'bg-white text-[var(--primary-700)] shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'">
                                <i [class]="op.icon + (tiposActivos.has(op.value) ? '' : ' opacity-40')"></i>
                                {{ op.label }}
                            </button>
                        }
                    </div>
                </div>

                <div class="md:col-span-2">
                    <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                        Producto
                    </p>
                </div>

                <div class="md:col-span-2">
                    <app-form-multi-select
                        label="Producto"
                        [single]="true"
                        [showSearch]="true"
                        [options]="productosFiltrados"
                        [control]="getControl('producto')"
                        (onOpen)="cargarProductos()"
                    />
                </div>

                <div class="md:col-span-2">
                    <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                        Información de consumo
                    </p>
                </div>

                <app-form-input
                    label="Cantidad a consumir"
                    type="number"
                    icon="fa-solid fa-layer-group"
                    placeholder="Ej: 2"
                    [required]="true"
                    [control]="getControl('cantidad')"
                />

                <app-form-input
                    label="Stock actual"
                    type="number"
                    icon="fa-solid fa-warehouse"
                    placeholder="Se rellena al seleccionar"
                    [control]="getControl('stockActual')"
                />

            </form>

            <div actions class="flex flex-col sm:flex-row gap-3 w-full">
                <app-button
                    text="Registrar Consumo"
                    iconClass="fa-solid fa-bowl-food"
                    [disabled]="consumirProductoForm.invalid"
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

        </app-form-container>
    `
})
export class ConsumirProductoComponent extends BaseComponent {
    private fb                = inject(FormBuilder);
    private http              = inject(HttpClient);
    private movimientoService = inject(EventoAlmacenService);

    readonly tipoOpciones = [
        { value: 'OBRADOR' as TipoProducto, label: 'Obrador', icon: 'fa-solid fa-utensils' },
        { value: 'TIENDA'  as TipoProducto, label: 'Tienda',  icon: 'fa-solid fa-shop'     },
    ];

    tiposActivos = new Set<TipoProducto>();
    productos: Producto[] = [];
    productosFiltrados: string[] = [];

    consumirProductoForm: FormGroup = this.fb.group({
        producto:    ['', [Validators.required]],
        cantidad:    [1,  [Validators.required, Validators.min(1)]],
        stockActual: [{ value: '', disabled: true }]
    });

    constructor() {
        super();
        this.consumirProductoForm.get('producto')!.valueChanges.subscribe(nombre => {
            const prod = this.productos.find(p => p.nombre === nombre);
            if (prod) {
                this.consumirProductoForm.get('stockActual')!.setValue(prod.stockActual, { emitEvent: false });
            }
        });
    }

    toggleTipo(tipo: TipoProducto) {
        if (this.tiposActivos.has(tipo)) {
            this.tiposActivos.delete(tipo);
        } else {
            this.tiposActivos.add(tipo);
        }
        // Necesario para que Angular detecte el cambio en el Set
        this.tiposActivos = new Set(this.tiposActivos);
        this.consumirProductoForm.get('producto')!.setValue('', { emitEvent: false });
        this.aplicarFiltro();
        if (this.productos.length === 0 && this.tiposActivos.size > 0) {
            this.cargarProductos();
        }
    }

    aplicarFiltro() {
        const ambos = this.tiposActivos.size === 0 || this.tiposActivos.size === 2;
        this.productosFiltrados = this.productos
            .filter(p => ambos || this.tiposActivos.has(p.tipoProducto!) || p.tipoProducto === 'AMBOS')
            .map(p => p.nombre);
    }

    getControl(name: string) {
        return this.consumirProductoForm.get(name) as FormControl;
    }

    onSubmit() {
        if (this.consumirProductoForm.invalid) { this.consumirProductoForm.markAllAsTouched(); return; }

        const val  = this.consumirProductoForm.value;
        const prod = this.productos.find(p => p.nombre === val.producto);
        if (!prod) return;

        if (prod.stockActual < val.cantidad) {
            this.notif.warning('Stock insuficiente para realizar el consumo', 'Stock insuficiente');
            return;
        }

        this.movimientoService.registrar({
            productoId: prod.id,
            tipo:       'SALIDA',
            cantidad:   val.cantidad,
            motivo:     'Consumo manual'
        }).subscribe({
            next: () => {
                this.notif.success('Consumo registrado correctamente', 'Consumo');
                this.consumirProductoForm.reset();
                this.tiposActivos = new Set();
                this.productosFiltrados = [];
                this.router.navigate(['/almacen/gestion']);
            },
            error: (err) => this.notif.error(
                err.error?.message || 'Error al registrar el consumo', 'Error'
            )
        });
    }

    onCancel() {
        this.notif.info('Formulario limpiado correctamente', 'Info');
        this.consumirProductoForm.reset();
        this.tiposActivos = new Set();
        this.productosFiltrados = [];
    }

    cargarProductos() {
        if (this.productos.length > 0) { this.aplicarFiltro(); return; }
        this.http.get<Producto[]>('/api/productos').subscribe({
            next: (data) => {
                this.productos = data;
                this.aplicarFiltro();
            },
            error: () => this.notif.error('Error al cargar la lista de productos', 'Error')
        });
    }
}
