import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Proveedor } from '../../core/models/proveedor.model';
import { Producto, UNIDADES_MEDIDA } from '../../core/models/producto.model';
import { PlantillaPedido } from '../../core/models/pedido.model';
import { ProveedorService } from '../../core/services/proveedor.service';
import { ProductoService } from '../../core/services/producto.service';
import { PlantillaPedidoService } from '../../core/services/plantilla-pedido.service';
import { PedidoService } from '../../core/services/pedido.service';
import { FormContainerComponent } from '../../shared/form/form-container.component';
import { FormInputComponent } from '../../shared/form/form-input.component';
import { FormTextareaComponent } from '../../shared/form/form-textarea.component';
import { FormMultiSelectComponent } from '../../shared/form/form-multiselect.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { BaseComponent } from '../../core/base/base.component';

@Component({
    selector: 'app-nuevo-pedido',
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
            title="Nuevo Pedido"
            [subtitle]="desdePlantilla() ? 'Cargado desde plantilla «' + desdePlantilla()!.nombre + '»' : 'Crea un pedido de productos a un proveedor'"
            icon="fa-solid fa-cart-shopping">

            <form [formGroup]="form" class="flex flex-col gap-8">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div class="md:col-span-2">
                        <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">Datos del Pedido</p>
                    </div>

                    <app-form-multi-select
                        label="Proveedor"
                        [single]="true"
                        [options]="nombresProveedores()"
                        [control]="ctrl('proveedor')"
                        (onItemAdded)="onProveedorSeleccionado($event)" />

                    <app-form-input
                        label="Fecha de entrega estimada"
                        type="date"
                        icon="fa-solid fa-calendar"
                        [control]="ctrl('fechaEntrega')" />

                    <app-form-textarea
                        class="md:col-span-2"
                        label="Observaciones"
                        placeholder="Notas adicionales (opcional)"
                        [control]="ctrl('observaciones')" />
                </div>

                <!-- Artículos -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                            Artículos del Pedido
                        </p>
                        <button type="button" (click)="agregarItem()"
                            [disabled]="!selectedProveedor()"
                            class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   bg-[var(--primary-100)] text-[var(--primary-700)] hover:bg-[var(--primary-200)]">
                            <i class="fa-solid fa-plus text-xs"></i> Agregar artículo
                        </button>
                    </div>

                    @if (!selectedProveedor()) {
                        <div class="flex items-center justify-center py-10 rounded-2xl
                                    border-2 border-dashed border-gray-200 text-gray-400 text-sm gap-2">
                            <i class="fa-solid fa-store"></i>
                            Selecciona un proveedor para ver sus productos
                        </div>
                    } @else if (items.length === 0) {
                        <div class="flex items-center justify-center py-10 rounded-2xl
                                    border-2 border-dashed border-gray-200 text-gray-400 text-sm gap-2">
                            <i class="fa-solid fa-box-open"></i>
                            Añade al menos un artículo al pedido
                        </div>
                    }

                    <div class="flex flex-col gap-3">
                        @for (item of items.controls; track $index) {
                            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div class="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_40px] gap-3 items-end">
                                    <app-form-multi-select
                                        label="Producto"
                                        [single]="true"
                                        [showSearch]="true"
                                        [options]="nombresProductosFiltrados()"
                                        [control]="itemCtrl($index, 'producto')"
                                        (onItemAdded)="onProductoSeleccionado($index, $event)" />

                                    <app-form-input
                                        label="Cantidad"
                                        type="number"
                                        placeholder="1"
                                        [control]="itemCtrl($index, 'cantidad')" />

                                    <app-form-input
                                        label="Precio/ud (€)"
                                        type="number"
                                        placeholder="0.00"
                                        [control]="itemCtrl($index, 'precio')" />

                                    <button type="button" (click)="eliminarItem($index)"
                                        class="h-[46px] w-full sm:w-10 rounded-xl bg-red-50 text-red-400
                                               hover:bg-red-100 transition-colors flex items-center justify-center">
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    </button>
                                </div>

                                <div class="flex flex-wrap items-center gap-x-4 gap-y-0.5 px-1 mt-2">
                                    @if (costeItem($index) > 0) {
                                        <span class="text-[11px] font-bold text-[var(--primary-600)] flex items-center gap-1">
                                            <i class="fa-solid fa-tag text-[9px]"></i>
                                            Total: {{ costeItem($index).toFixed(2) }}€
                                        </span>
                                    }
                                    @if (infoProducto($index); as info) {
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
                                    }
                                </div>
                            </div>
                        }
                    </div>

                    @if (items.length > 0 && costeTotal > 0) {
                        <div class="flex items-center justify-end mt-4 px-1">
                            <div class="flex items-center gap-3 px-5 py-3 rounded-2xl
                                        bg-[var(--primary-50)] border border-[var(--primary-200)]">
                                <i class="fa-solid fa-coins text-[var(--primary-500)]"></i>
                                <span class="text-sm text-[var(--primary-700)]">Coste estimado total</span>
                                <span class="text-lg font-black text-[var(--primary-700)]">
                                    {{ costeTotal.toFixed(2) }}€
                                </span>
                            </div>
                        </div>
                    }
                </div>
            </form>

            <div actions class="flex flex-col sm:flex-row gap-3 w-full">
                <app-button
                    text="Enviar Pedido"
                    iconClass="fa-solid fa-paper-plane"
                    [disabled]="form.invalid || items.length === 0 || enviando()"
                    (click)="submit()"
                    bgColor="bg-[var(--primary-600)]"
                    hoverBgColor="hover:bg-[var(--primary-700)]" />
                <app-button
                    text="Guardar como plantilla"
                    iconClass="fa-solid fa-bookmark"
                    [disabled]="!selectedProveedor() || items.length === 0"
                    (click)="abrirGuardarPlantilla()"
                    bgColor="bg-slate-100"
                    contentColor="text-slate-600"
                    hoverBgColor="hover:bg-slate-200" />
                <app-button
                    text="Cancelar"
                    bgColor="bg-white"
                    contentColor="text-slate-500"
                    hoverBgColor="hover:bg-gray-50"
                    (click)="router.navigate(['/pedidos/pendientes'])" />
            </div>
        </app-form-container>

        <!-- Modal guardar como plantilla -->
        @if (modalPlantilla()) {
            <app-modal
                title="Guardar como plantilla"
                subtitle="Dale un nombre para reutilizarla fácilmente"
                saveLabel="Guardar plantilla"
                [saving]="guardandoPlantilla()"
                (onClose)="modalPlantilla.set(false)"
                (onSave)="guardarComoPlantilla()">
                <div class="flex flex-col gap-4">
                    <app-form-input
                        label="Nombre de la plantilla"
                        placeholder="Ej: Pedido semanal lácteos"
                        [control]="nombrePlantillaCtrl" />
                    <app-form-textarea
                        label="Descripción (opcional)"
                        placeholder="Para qué se usa esta plantilla"
                        [control]="descPlantillaCtrl" />
                </div>
            </app-modal>
        }

        <!-- Modal aviso al salir -->
        @if (modalSalida()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
                            </div>
                            <div>
                                <p class="font-bold text-slate-800">¿Salir sin guardar?</p>
                                <p class="text-sm text-slate-500">El pedido se perderá si no lo guardas como borrador</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button type="button" (click)="guardarBorradorYSalir()"
                            [disabled]="guardandoBorrador()"
                            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                                   bg-[var(--primary-600)] text-white font-semibold text-sm
                                   hover:bg-[var(--primary-700)] transition-colors disabled:opacity-50">
                            @if (guardandoBorrador()) {
                                <i class="fa-solid fa-spinner animate-spin text-xs"></i>
                            } @else {
                                <i class="fa-solid fa-bookmark text-xs"></i>
                            }
                            Guardar como borrador
                        </button>
                        <button type="button" (click)="confirmarSalida()"
                            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                                   bg-red-50 text-red-600 font-semibold text-sm
                                   hover:bg-red-100 transition-colors border border-red-200">
                            <i class="fa-solid fa-door-open text-xs"></i>
                            Salir sin guardar
                        </button>
                        <button type="button" (click)="cancelarSalida()"
                            class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                                   text-slate-500 text-sm hover:bg-slate-50 transition-colors">
                            Seguir editando
                        </button>
                    </div>
                </div>
            </div>
        }
    `
})
export class NuevoPedidoComponent extends BaseComponent implements OnInit {
    private fb           = inject(FormBuilder);
    private http         = inject(HttpClient);
    private provSvc      = inject(ProveedorService);
    private prodSvc      = inject(ProductoService);
    private plantillaSvc = inject(PlantillaPedidoService);
    private pedidoSvc    = inject(PedidoService);

    proveedores        = signal<Proveedor[]>([]);
    productos          = signal<Producto[]>([]);
    enviando           = signal(false);
    selectedProveedor  = signal<Proveedor | null>(null);
    desdePlantilla     = signal<PlantillaPedido | null>(null);
    modalPlantilla     = signal(false);
    guardandoPlantilla = signal(false);
    modalSalida        = signal(false);
    guardandoBorrador  = signal(false);

    private salidaSubject: Subject<boolean> | null = null;

    // El guard llama a esto antes de salir de la ruta. Devuelve un Observable porque
    // puede que necesitemos esperar a que el usuario decida en el modal.
    // Si no hay nada relleno, o si venía de un borrador existente, dejamos salir libremente
    canDeactivate(): Observable<boolean> {
        if (!this.selectedProveedor() && this.items.length === 0) return new Observable(o => { o.next(true); o.complete(); });
        if (this.borradorId) return new Observable(o => { o.next(true); o.complete(); });
        this.modalSalida.set(true);
        this.salidaSubject = new Subject<boolean>();
        return this.salidaSubject.asObservable();
    }

    // Serializa el formulario actual como borrador y lo persiste antes de salir.
    // Si no hay proveedor seleccionado no hay nada que guardar, se sale directamente.
    guardarBorradorYSalir() {
        const prov = this.selectedProveedor();
        if (!prov) { this.confirmarSalida(); return; }

        const itemsPayload = this.items.controls
            .map(ctrl => {
                const nombre = ctrl.get('producto')?.value as string;
                const prod   = this.productosFiltrados().find(p => p.nombre === nombre);
                return prod ? { productoId: prod.id, cantidadSolicitada: ctrl.get('cantidad')?.value, precio: ctrl.get('precio')?.value ?? 0 } : null;
            })
            .filter(Boolean);

        const payload = {
            proveedorId:   prov.id,
            fechaEntrega:  this.form.value.fechaEntrega ? `${this.form.value.fechaEntrega}T00:00:00` : null,
            observaciones: this.form.value.observaciones || null,
            items:         itemsPayload,
        };

        this.guardandoBorrador.set(true);
        this.pedidoSvc.guardarBorrador(payload).subscribe({
            next: () => {
                this.notif.info('Borrador guardado correctamente', 'Borrador');
                this.guardandoBorrador.set(false);
                this.modalSalida.set(false);
                this.salidaSubject?.next(true);
                this.salidaSubject?.complete();
            },
            error: () => {
                this.notif.error('Error al guardar el borrador', 'Error');
                this.guardandoBorrador.set(false);
            },
        });
    }

    confirmarSalida() {
        this.modalSalida.set(false);
        this.salidaSubject?.next(true);
        this.salidaSubject?.complete();
    }

    cancelarSalida() {
        this.modalSalida.set(false);
        this.salidaSubject?.next(false);
        this.salidaSubject?.complete();
    }

    nombrePlantillaCtrl = new FormControl('', Validators.required);
    descPlantillaCtrl   = new FormControl('');

    // Solo expone los productos del proveedor seleccionado para que no se pueda
    // pedir un artículo que ese proveedor no suministra.
    productosFiltrados = computed(() => {
        const prov  = this.selectedProveedor();
        const todos = this.productos();
        if (!prov) return todos;
        return todos.filter(p => p.proveedor?.id === prov.id);
    });

    form: FormGroup = this.fb.group({
        proveedor:     ['', Validators.required],
        fechaEntrega:  [''],
        observaciones: [''],
        items:         this.fb.array([]),
    });

    get items(): FormArray { return this.form.get('items') as FormArray; }

    nombresProveedores        = () => this.proveedores().map(p => p.nombre);
    nombresProductosFiltrados = () => this.productosFiltrados().map(p => p.nombre);

    ngOnInit() {
        this.provSvc.getAll().subscribe(data => {
            this.proveedores.set(data);
            this.intentarCargarDesdePlantilla();
        });
        this.prodSvc.getAll().subscribe(data => {
            this.productos.set(data);
            this.intentarCargarDesdePlantilla();
        });
    }

    private datosPlantillaPendiente: PlantillaPedido | null = null;
    borradorId: number | null = null;

    private intentarCargarDesdePlantilla() {
        // Se llama dos veces: al resolver proveedores y al resolver productos.
        // Solo procede cuando ambas listas están disponibles para cruzar ids con nombres.

        // Cargar desde borrador
        const borrador = history.state?.borrador as (import('../../core/models/pedido.model').Pedido | undefined);
        if (borrador && !this.borradorId) {
            if (!this.proveedores().length || !this.productos().length) return;
            this.borradorId = borrador.id;
            history.replaceState({}, '');
            const prov = this.proveedores().find(p => p.id === borrador.proveedor?.id) ?? null;
            if (prov) {
                this.selectedProveedor.set(prov);
                this.form.patchValue({ proveedor: prov.nombre, observaciones: borrador.observaciones ?? '' });
                while (this.items.length) this.items.removeAt(0);
                (borrador.items ?? []).forEach((item: any) => {
                    const prod = this.productosFiltrados().find(p => p.id === item.productoId || p.nombre === item.productoNombre);
                    this.items.push(this.fb.group({
                        producto: [prod?.nombre ?? item.productoNombre, Validators.required],
                        cantidad: [item.cantidadSolicitada, [Validators.required, Validators.min(0.01)]],
                        precio:   [item.precio ?? 0, Validators.min(0)],
                    }));
                });
            }
            return;
        }

        // Cargar desde plantilla
        const plantilla = this.datosPlantillaPendiente ?? (history.state?.plantilla as PlantillaPedido | undefined);
        if (!plantilla) return;
        if (!this.proveedores().length || !this.productos().length) return;

        this.datosPlantillaPendiente = null;
        this.desdePlantilla.set(plantilla);
        history.replaceState({}, '');

        const prov = this.proveedores().find(p => p.id === plantilla.proveedor?.id) ?? null;
        if (!prov) return;

        this.selectedProveedor.set(prov);
        this.form.patchValue({
            proveedor:     prov.nombre,
            observaciones: plantilla.observaciones ?? '',
        });

        while (this.items.length) this.items.removeAt(0);
        plantilla.items.forEach(item => {
            const prod = this.productos().find(p => p.id === item.productoId || p.nombre === item.productoNombre);
            this.items.push(this.fb.group({
                producto: [prod?.nombre ?? item.productoNombre, Validators.required],
                cantidad: [item.cantidadSolicitada, [Validators.required, Validators.min(0.01)]],
                precio:   [item.precio, Validators.min(0)],
            }));
        });
    }

    onProveedorSeleccionado(nombre: string) {
        const prov = this.proveedores().find(p => p.nombre === nombre) ?? null;
        this.selectedProveedor.set(prov);
        while (this.items.length) this.items.removeAt(0);
        this.agregarItem();
    }

    onProductoSeleccionado(i: number, nombre: string) {
        const prod = this.productosFiltrados().find(p => p.nombre === nombre);
        if (prod?.precio != null) this.itemCtrl(i, 'precio').setValue(prod.precio);
    }

    // Devuelve el stock actual, mínimo y tamaño de envase del producto seleccionado
    // en la fila i para mostrárselos al usuario como referencia al rellenar la cantidad.
    infoProducto(i: number): { stock: string; stockMinimo: string; envase: string | null } | null {
        const nombre = this.itemCtrl(i, 'producto').value as string;
        if (!nombre) return null;
        const prod = this.productosFiltrados().find(p => p.nombre === nombre);
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

    agregarItem() {
        this.items.push(this.fb.group({
            producto: ['', Validators.required],
            cantidad: [1,  [Validators.required, Validators.min(0.01)]],
            precio:   [0,  Validators.min(0)],
        }));
    }

    eliminarItem(i: number) { this.items.removeAt(i); }

    ctrl(name: string): FormControl { return this.form.get(name) as FormControl; }
    itemCtrl(i: number, name: string): FormControl { return this.items.at(i).get(name) as FormControl; }

    costeItem(i: number): number {
        const cantidad = +(this.itemCtrl(i, 'cantidad').value) || 0;
        const precio   = +(this.itemCtrl(i, 'precio').value)   || 0;
        return cantidad * precio;
    }

    get costeTotal(): number {
        let total = 0;
        for (let i = 0; i < this.items.length; i++) total += this.costeItem(i);
        return total;
    }

    abrirGuardarPlantilla() {
        this.nombrePlantillaCtrl.reset('');
        this.descPlantillaCtrl.reset('');
        this.modalPlantilla.set(true);
    }

    guardarComoPlantilla() {
        if (this.nombrePlantillaCtrl.invalid) { this.nombrePlantillaCtrl.markAsTouched(); return; }
        const prov = this.selectedProveedor();
        if (!prov) return;

        const items = this.items.controls
            .map(ctrl => {
                const nombre = ctrl.get('producto')?.value as string;
                const prod   = this.productosFiltrados().find(p => p.nombre === nombre);
                return prod ? {
                    productoId:         prod.id,
                    cantidadSolicitada: ctrl.get('cantidad')?.value,
                    precio:             ctrl.get('precio')?.value ?? 0,
                } : null;
            })
            .filter(Boolean);

        const payload = {
            nombre:        this.nombrePlantillaCtrl.value,
            descripcion:   this.descPlantillaCtrl.value || null,
            proveedorId:   prov.id,
            observaciones: this.form.value.observaciones || null,
            items,
        };

        this.guardandoPlantilla.set(true);
        this.plantillaSvc.create(payload).subscribe({
            next: () => {
                this.notif.info('Plantilla guardada correctamente', 'Plantillas');
                this.guardandoPlantilla.set(false);
                this.modalPlantilla.set(false);
            },
            error: () => {
                this.notif.error('Error al guardar la plantilla', 'Error');
                this.guardandoPlantilla.set(false);
            },
        });
    }

    // Si el pedido viene de un borrador, lo elimina antes de enviar el definitivo
    // para no dejar duplicados. El envío ocurre tanto si el delete tiene éxito como si falla.
    submit() {
        if (this.form.invalid || this.items.length === 0) {
            this.form.markAllAsTouched();
            return;
        }

        const prov = this.selectedProveedor();
        if (!prov) return;

        const itemsPayload = this.items.controls
            .map(ctrl => {
                const nombre = ctrl.get('producto')?.value as string;
                const prod   = this.productosFiltrados().find(p => p.nombre === nombre);
                return prod ? {
                    productoId:         prod.id,
                    cantidadSolicitada: ctrl.get('cantidad')?.value,
                    precio:             ctrl.get('precio')?.value ?? 0,
                } : null;
            })
            .filter(Boolean);

        const payload = {
            proveedorId:   prov.id,
            fechaEntrega:  this.form.value.fechaEntrega
                ? `${this.form.value.fechaEntrega}T00:00:00`
                : null,
            observaciones: this.form.value.observaciones || null,
            items:         itemsPayload,
        };

        this.enviando.set(true);
        const enviar = () => this.http.post('/api/pedidos', payload).subscribe({
            next: () => {
                this.notif.info('Pedido creado correctamente', 'Pedido');
                this.borradorId = null;
                this.router.navigate(['/pedidos/pendientes']);
            },
            error: () => {
                this.notif.error('Error al crear el pedido', 'Error');
                this.enviando.set(false);
            },
        });

        if (this.borradorId) {
            this.pedidoSvc.delete(this.borradorId).subscribe({ next: enviar, error: enviar });
        } else {
            enviar();
        }
    }
}
