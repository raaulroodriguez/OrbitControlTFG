import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlantillaPedido } from '../../core/models/pedido.model';
import { Proveedor } from '../../core/models/proveedor.model';
import { Producto, UNIDADES_MEDIDA } from '../../core/models/producto.model';
import { PlantillaPedidoService } from '../../core/services/plantilla-pedido.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { ProductoService } from '../../core/services/producto.service';
import { FormContainerComponent } from '../../shared/form/form-container.component';
import { FormInputComponent } from '../../shared/form/form-input.component';
import { FormTextareaComponent } from '../../shared/form/form-textarea.component';
import { FormMultiSelectComponent } from '../../shared/form/form-multiselect.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { BaseComponent } from '../../core/base/base.component';

@Component({
    selector: 'app-plantillas-pedido',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormContainerComponent,
        FormInputComponent,
        FormTextareaComponent,
        FormMultiSelectComponent,
        ButtonComponent,
        ModalComponent,
    ],
    template: `
        <app-form-container
            title="Plantillas de Pedido"
            subtitle="Guarda combinaciones de proveedor y productos para reutilizarlas rápidamente"
            icon="fa-solid fa-bookmark">

            <div class="flex flex-col gap-3">
                @if (cargando()) {
                    <div class="flex items-center justify-center py-16 text-slate-400 gap-2">
                        <i class="fa-solid fa-circle-notch fa-spin"></i> Cargando plantillas...
                    </div>
                } @else if (plantillas().length === 0) {
                    <div class="flex flex-col items-center justify-center py-16 rounded-2xl
                                border-2 border-dashed border-gray-200 text-gray-400 gap-3">
                        <i class="fa-solid fa-bookmark text-3xl"></i>
                        <p class="text-sm">No hay plantillas creadas todavía</p>
                        <button (click)="abrirNueva()"
                            class="px-4 py-2 rounded-xl bg-[var(--primary-100)] text-[var(--primary-700)]
                                   text-xs font-bold hover:bg-[var(--primary-200)] transition-colors">
                            <i class="fa-solid fa-plus mr-1.5"></i>Crear plantilla
                        </button>
                    </div>
                } @else {
                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    @for (pt of plantillas(); track pt.id) {
                        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
                                    hover:border-[var(--primary-200)] hover:shadow-md transition-all">
                            <!-- Cabecera degradada -->
                            <div class="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] px-4 pt-4 pb-5">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex items-center gap-2.5 min-w-0">
                                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                            <i class="fa-solid fa-bookmark text-white text-xs"></i>
                                        </div>
                                        <div class="min-w-0">
                                            <p class="font-bold text-white text-sm truncate">{{ pt.nombre }}</p>
                                            <p class="text-white/60 text-[11px] truncate">{{ pt?.proveedor?.nombre ?? '—' }}</p>
                                        </div>
                                    </div>
                                    <span class="shrink-0 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                                        Plantilla
                                    </span>
                                </div>
                            </div>

                            <!-- Stats -->
                            <div class="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                                <p class="text-[11px] text-slate-400">
                                    <i class="fa-solid fa-boxes-stacked mr-1"></i>
                                    {{ pt.items.length }} artículo{{ pt.items.length !== 1 ? 's' : '' }}
                                </p>
                            </div>

                            @if (pt.descripcion) {
                                <div class="px-4 py-2 border-b border-slate-100">
                                    <p class="text-xs text-slate-500 truncate">
                                        <i class="fa-solid fa-note-sticky text-slate-300 mr-1"></i>{{ pt.descripcion }}
                                    </p>
                                </div>
                            }

                            @if (pt.items.length > 0) {
                                <div class="px-4 py-2 border-b border-slate-100">
                                    <div class="flex flex-wrap gap-1">
                                        @for (item of pt.items; track item.id) {
                                            <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                                                {{ item.productoNombre }}
                                                <span class="text-slate-400 ml-0.5">×{{ item.cantidadSolicitada }}</span>
                                            </span>
                                        }
                                    </div>
                                </div>
                            }

                            <!-- Acciones -->
                            <div class="px-4 py-3 flex gap-2">
                                <button (click)="usarPlantilla(pt)"
                                    class="flex-1 py-2 rounded-xl bg-[var(--primary-600)] hover:bg-[var(--primary-700)]
                                           text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                    <i class="fa-solid fa-play text-[9px]"></i> Usar
                                </button>
                                <button (click)="abrirEditar(pt)"
                                    class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200
                                           text-slate-600 text-xs font-bold transition-colors flex items-center justify-center">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button (click)="eliminar(pt)"
                                    class="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100
                                           text-red-400 text-xs font-bold transition-colors flex items-center justify-center">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    }
                    </div>
                }
            </div>

            <div actions class="flex gap-3 w-full">
                <app-button
                    text="Nueva plantilla"
                    iconClass="fa-solid fa-plus"
                    (click)="abrirNueva()"
                    bgColor="bg-[var(--primary-600)]"
                    hoverBgColor="hover:bg-[var(--primary-700)]" />
            </div>
        </app-form-container>

        @if (modalAbierto()) {
            <app-modal
                [title]="editando() ? 'Editar plantilla' : 'Nueva plantilla'"
                subtitle="Define el proveedor y los artículos habituales"
                [saveLabel]="editando() ? 'Actualizar' : 'Guardar'"
                [saving]="guardando()"
                [wide]="true"
                (onClose)="cerrarModal()"
                (onSave)="guardar()">

                <div class="flex flex-col gap-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                        <app-form-input
                            label="Nombre de la plantilla"
                            placeholder="Ej: Pedido semanal lácteos"
                            [control]="fCtrl('nombre')" />
                        <app-form-multi-select
                            label="Proveedor"
                            [single]="true"
                            [options]="nombresProveedores()"
                            [control]="fCtrl('proveedor')"
                            (onItemAdded)="onProveedorModal($event)" />
                    </div>

                    <app-form-textarea
                        class="sm:col-span-2"
                        label="Descripción (opcional)"
                        placeholder="Para qué se usa esta plantilla"
                        [control]="fCtrl('descripcion')" />

                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                                Artículos
                            </p>
                            <button type="button" (click)="agregarItemModal()"
                                [disabled]="!proveedorModal()"
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                       bg-[var(--primary-100)] text-[var(--primary-700)] hover:bg-[var(--primary-200)]">
                                <i class="fa-solid fa-plus text-xs"></i> Agregar
                            </button>
                        </div>

                        @if (!proveedorModal()) {
                            <p class="text-xs text-slate-400 text-center py-6 rounded-2xl
                                      border-2 border-dashed border-gray-200">
                                <i class="fa-solid fa-store mr-1"></i>Selecciona un proveedor primero
                            </p>
                        } @else if (modalItems.length === 0) {
                            <p class="text-xs text-slate-400 text-center py-6 rounded-2xl
                                      border-2 border-dashed border-gray-200">
                                <i class="fa-solid fa-box-open mr-1"></i>Sin artículos todavía
                            </p>
                        }

                        <div class="flex flex-col gap-2">
                            @for (item of modalItems.controls; track $index) {
                                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div class="grid grid-cols-1 sm:grid-cols-[1fr_110px_110px_36px] gap-2 items-end">
                                        <app-form-multi-select
                                            label="Producto" [single]="true" [showSearch]="true"
                                            [options]="nombresProductosModal()"
                                            [control]="miCtrl($index, 'producto')"
                                            (onItemAdded)="onProductoModal($index, $event)" />
                                        <app-form-input label="Cantidad" type="number" placeholder="1"
                                            [control]="miCtrl($index, 'cantidad')" />
                                        <app-form-input label="Precio/ud (€)" type="number" placeholder="0.00"
                                            [control]="miCtrl($index, 'precio')" />
                                        <button type="button" (click)="quitarItemModal($index)"
                                            class="h-[46px] w-full sm:w-9 rounded-xl bg-red-50 text-red-400
                                                   hover:bg-red-100 transition-colors flex items-center justify-center">
                                            <i class="fa-solid fa-trash text-xs"></i>
                                        </button>
                                    </div>
                                    @if (infoItemModal($index); as info) {
                                        <div class="flex flex-wrap gap-x-4 mt-1.5 px-1">
                                            <span class="text-[11px] text-slate-400 flex items-center gap-1">
                                                <i class="fa-solid fa-warehouse text-[9px]"></i>
                                                Stock: <span class="font-semibold text-slate-500">{{ info.stock }}</span>
                                            </span>
                                            <span class="text-[11px] text-slate-400 flex items-center gap-1">
                                                <i class="fa-solid fa-arrow-down-up-across-line text-[9px]"></i>
                                                Mínimo: <span class="font-semibold text-slate-500">{{ info.stockMinimo }}</span>
                                            </span>
                                            @if (info.envase) {
                                                <span class="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <i class="fa-solid fa-box text-[9px]"></i>
                                                    Envase: <span class="font-semibold text-slate-500">{{ info.envase }}</span>
                                                </span>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </app-modal>
        }
    `
})
export class PlantillasPedidoComponent extends BaseComponent implements OnInit {
    private fb      = inject(FormBuilder);
    private plantillaPedidoService     = inject(PlantillaPedidoService);
    private proveedorService = inject(ProveedorService);
    private productoService = inject(ProductoService);

    plantillas     = signal<PlantillaPedido[]>([]);
    proveedores    = signal<Proveedor[]>([]);
    productos      = signal<Producto[]>([]);
    cargando       = signal(true);
    modalAbierto   = signal(false);
    editando       = signal<PlantillaPedido | null>(null);
    guardando      = signal(false);
    proveedorModal = signal<Proveedor | null>(null);

    productosModal = computed(() => {
        const prov = this.proveedorModal();
        if (!prov) return [];
        return this.productos().filter(p => p.proveedor?.id === prov.id);
    });

    nombresProveedores    = () => this.proveedores().map(p => p.nombre);
    nombresProductosModal = () => this.productosModal().map(p => p.nombre);

    form: FormGroup = this.fb.group({
        nombre:      ['', Validators.required],
        descripcion: [''],
        proveedor:   ['', Validators.required],
        items:       this.fb.array([]),
    });

    get modalItems(): FormArray { return this.form.get('items') as FormArray; }

    fCtrl(name: string): FormControl { return this.form.get(name) as FormControl; }
    miCtrl(i: number, n: string): FormControl { return this.modalItems.at(i).get(n) as FormControl; }

    ngOnInit() {
        this.proveedorService.getAll().subscribe(data => this.proveedores.set(data));
        this.productoService.getAll().subscribe(data => this.productos.set(data));
        this.cargar();
    }

    cargar() {
        this.cargando.set(true);
        this.plantillaPedidoService.getAll().subscribe({
            next: data => { this.plantillas.set(data); this.cargando.set(false); },
            error: ()  => this.cargando.set(false),
        });
    }

    abrirNueva() {
        this.editando.set(null);
        this.proveedorModal.set(null);
        this.form.reset({ nombre: '', descripcion: '', proveedor: '' });
        while (this.modalItems.length) this.modalItems.removeAt(0);
        this.modalAbierto.set(true);
    }

    abrirEditar(pt: PlantillaPedido) {
        this.editando.set(pt);
        const prov = this.proveedores().find(p => p.id === pt.proveedor?.id) ?? null;
        this.proveedorModal.set(prov);
        this.form.patchValue({
            nombre:      pt.nombre,
            descripcion: pt.descripcion ?? '',
            proveedor:   pt.proveedor?.nombre ?? '',
        });
        while (this.modalItems.length) this.modalItems.removeAt(0);
        pt.items.forEach(item => {
            this.modalItems.push(this.fb.group({
                producto: [item.productoNombre, Validators.required],
                cantidad: [item.cantidadSolicitada, [Validators.required, Validators.min(0.01)]],
                precio:   [item.precio, Validators.min(0)],
            }));
        });
        this.modalAbierto.set(true);
    }

    cerrarModal() { this.modalAbierto.set(false); this.editando.set(null); }

    onProveedorModal(nombre: string) {
        const prov = this.proveedores().find(p => p.nombre === nombre) ?? null;
        this.proveedorModal.set(prov);
        while (this.modalItems.length) this.modalItems.removeAt(0);
    }

    agregarItemModal() {
        this.modalItems.push(this.fb.group({
            producto: ['', Validators.required],
            cantidad: [1,  [Validators.required, Validators.min(0.01)]],
            precio:   [0,  Validators.min(0)],
        }));
    }

    quitarItemModal(i: number) { this.modalItems.removeAt(i); }

    onProductoModal(i: number, nombre: string) {
        const prod = this.productosModal().find(p => p.nombre === nombre);
        if (prod?.precio != null) this.miCtrl(i, 'precio').setValue(prod.precio);
    }

    infoItemModal(i: number): { stock: string; stockMinimo: string; envase: string | null } | null {
        const nombre = this.miCtrl(i, 'producto').value as string;
        if (!nombre) return null;
        const prod = this.productosModal().find(p => p.nombre === nombre);
        if (!prod) return null;
        const um = UNIDADES_MEDIDA[prod.unidadMedida];
        return {
            stock:       `${prod.stockActual.toFixed(2)} ${um.abreviatura}`,
            stockMinimo: `${prod.stockMinimo.toFixed(2)} ${um.abreviatura}`,
            envase: prod.contenidoPorUnidad
                ? `${prod.contenidoPorUnidad} ${um.abreviatura} / ${prod.envase?.toLowerCase() ?? 'ud'}`
                : null,
        };
    }

    guardar() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        const prov = this.proveedorModal();
        if (!prov) return;

        const items = this.modalItems.controls
            .map(ctrl => {
                const nombre = ctrl.get('producto')?.value as string;
                const prod   = this.productosModal().find(p => p.nombre === nombre);
                return prod ? {
                    productoId:         prod.id,
                    cantidadSolicitada: ctrl.get('cantidad')?.value,
                    precio:             ctrl.get('precio')?.value ?? 0,
                } : null;
            })
            .filter(Boolean);

        const payload = {
            nombre:      this.form.value.nombre,
            descripcion: this.form.value.descripcion || null,
            proveedorId: prov.id,
            items,
        };

        this.guardando.set(true);
        const ed  = this.editando();
        const req = ed ? this.plantillaPedidoService.update(ed.id, payload) : this.plantillaPedidoService.create(payload);

        req.subscribe({
            next: result => {
                if (ed) {
                    this.plantillas.update(list => list.map(p => p.id === result.id ? result : p));
                    this.notif.info('Plantilla actualizada', 'Plantillas');
                } else {
                    this.plantillas.update(list => [...list, result]);
                    this.notif.info('Plantilla creada', 'Plantillas');
                }
                this.guardando.set(false);
                this.cerrarModal();
            },
            error: () => {
                this.notif.error('Error al guardar la plantilla', 'Error');
                this.guardando.set(false);
            },
        });
    }

    async eliminar(pt: PlantillaPedido) {
        const ok = await this.confirm.abrir({ mensaje: `¿Eliminar la plantilla "${pt.nombre}"?` });
        if (!ok) return;
        this.plantillaPedidoService.delete(pt.id).subscribe({
            next: () => {
                this.plantillas.update(list => list.filter(p => p.id !== pt.id));
                this.notif.info('Plantilla eliminada', 'Plantillas');
            },
            error: () => this.notif.error('Error al eliminar', 'Error'),
        });
    }

    usarPlantilla(pt: PlantillaPedido) {
        this.router.navigate(['/pedidos/nuevo'], { state: { plantilla: pt } });
    }
}
