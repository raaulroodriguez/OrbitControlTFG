import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { EstadoPedido, Pedido, ProductoPedido } from '../../core/models/pedido.model';
import { Producto, UNIDADES_MEDIDA } from '../../core/models/producto.model';
import { PedidoService } from '../../core/services/pedido.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { ProductoService } from '../../core/services/producto.service';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { FormInputComponent } from '../../shared/form/form-input.component';
import { FormTextareaComponent } from '../../shared/form/form-textarea.component';
import { FormMultiSelectComponent } from '../../shared/form/form-multiselect.component';
import { BaseComponent } from '../../core/base/base.component';

const ESTADO_CFG: Record<EstadoPedido, { label: string; icon: string; badgeBg: string; badgeText: string; headerGrad: string }> = {
    BORRADOR:  { label: 'Borrador',   icon: 'fa-pencil',       badgeBg: 'bg-amber-100',   badgeText: 'text-amber-700',   headerGrad: 'from-amber-400 to-amber-600'    },
    PENDIENTE: { label: 'Pendiente',  icon: 'fa-clock',        badgeBg: 'bg-blue-100',    badgeText: 'text-blue-700',    headerGrad: 'from-blue-500 to-blue-700'      },
    RECIBIDO:  { label: 'Recibido',   icon: 'fa-box-open',     badgeBg: 'bg-green-100',   badgeText: 'text-green-700',   headerGrad: 'from-green-500 to-green-700'    },
    PAGADO:    { label: 'Pagado',     icon: 'fa-check-circle', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', headerGrad: 'from-emerald-600 to-emerald-800'},
    CANCELADO: { label: 'Cancelado',  icon: 'fa-ban',          badgeBg: 'bg-slate-100',   badgeText: 'text-slate-600',   headerGrad: 'from-slate-400 to-slate-600'    },
};

const UM_ABREV: Record<string, string> = {
    KILOGRAMO: 'kg', GRAMO: 'g', LITRO: 'L', MILILITRO: 'ml', UNIDAD: 'ud', DOCENA: 'doc',
};
const ENVASE_LABEL: Record<string, string> = {
    BOTE: 'bote', BOTELLA: 'botella', SACO: 'saco', BOLSA: 'bolsa', CAJA: 'caja', UNIDAD: 'ud',
};

@Component({
    selector: 'app-modificar-pedido',
    standalone: true,
    imports: [
        ReactiveFormsModule, DecimalPipe,
        SectionHeaderComponent, FormInputComponent, FormTextareaComponent, FormMultiSelectComponent,
    ],
    template: `
        <app-section-header
            [title]="pedido() ? 'Pedido ' + (pedido()!.codigoPedido ?? '#' + pedido()!.id) : 'Detalle de Pedido'"
            [subtitle]="pedido()?.proveedor?.nombre ?? ''"
            icon="fa-solid fa-file-invoice">

            @if (pedido() && !modoEdicion()) {
                <button toolbar type="button" (click)="activarEdicion()"
                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                           text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
                    <i class="fa-solid fa-pen-to-square"></i> Editar
                </button>
            } @else if (modoEdicion()) {
                <div toolbar class="flex gap-2">
                    <button type="button" (click)="guardar()" [disabled]="form.invalid || guardando()"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                               text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95
                               disabled:opacity-50 disabled:cursor-not-allowed">
                        @if (guardando()) { <i class="fa-solid fa-spinner fa-spin"></i> }
                        @else { <i class="fa-solid fa-floppy-disk"></i> }
                        Guardar
                    </button>
                    <button type="button" (click)="cancelarEdicion()"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                               text-[var(--primary-600)] bg-white/70 hover:bg-white transition-colors shadow-sm active:scale-95">
                        <i class="fa-solid fa-xmark"></i> Cancelar
                    </button>
                </div>
            }
        </app-section-header>

        @if (cargando()) {
            <div class="bg-white rounded-2xl p-8 mt-4 animate-pulse flex flex-col gap-4">
                @for (_ of [1,2,3]; track $index) { <div class="h-12 bg-gray-100 rounded-xl"></div> }
            </div>
        } @else if (pedido()) {
            @let p = pedido()!;
            @let cfg = estadoCfg();

            <!-- ── Estado + acciones ── -->
            <div class="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                <!-- Cabecera estado -->
                <div class="bg-gradient-to-r {{ cfg.headerGrad }} px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <i class="fa-solid {{ cfg.icon }} text-white"></i>
                        </div>
                        <div>
                            <p class="text-white font-bold text-base leading-tight">{{ p.proveedor.nombre }}</p>
                            <p class="text-white/60 text-xs font-mono">{{ p.codigoPedido ?? '—' }}</p>
                        </div>
                    </div>
                    <span class="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold backdrop-blur-sm">
                        {{ cfg.label }}
                    </span>
                </div>

                <!-- Botones de acción estado -->
                @if (!modoEdicion() && transiciones().length > 0) {
                    <div class="px-5 py-4 flex flex-col sm:flex-row gap-2 border-b border-slate-100">
                        @for (t of transiciones(); track t.estado) {
                            <button type="button" (click)="cambiarEstado(t.estado)"
                                [disabled]="cambiandoEstado()"
                                class="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl
                                       text-sm font-bold transition-all active:scale-95 disabled:opacity-50 {{ t.btnClass }}">
                                @if (cambiandoEstado()) {
                                    <i class="fa-solid fa-spinner fa-spin"></i>
                                } @else {
                                    <i class="fa-solid {{ t.icon }}"></i>
                                }
                                <span>{{ t.label }}</span>
                            </button>
                        }
                    </div>
                }
                @if (!modoEdicion() && transiciones().length === 0) {
                    <div class="px-5 py-3 border-b border-slate-100">
                        <p class="text-xs text-slate-400 text-center">
                            <i class="fa-solid fa-lock mr-1"></i>
                            Estado final — no se puede modificar
                        </p>
                    </div>
                }

                <!-- Fechas -->
                <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                    <div class="flex flex-col items-center py-4 gap-0.5">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Pedido</p>
                        <p class="text-sm font-bold text-slate-700">{{ formatFecha(p.fechaPedido) }}</p>
                    </div>
                    <div class="flex flex-col items-center py-4 gap-0.5">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrega</p>
                        @if (p.fechaEntrega) {
                            <p class="text-sm font-bold" [class]="colorEntrega(p.fechaEntrega)">{{ formatFecha(p.fechaEntrega) }}</p>
                        } @else {
                            <p class="text-sm text-slate-400">—</p>
                        }
                    </div>
                    <div class="flex flex-col items-center py-4 gap-0.5">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Recibido</p>
                        @if (p.fechaRecibido) {
                            <p class="text-sm font-bold text-green-600">{{ formatFecha(p.fechaRecibido) }}</p>
                        } @else {
                            <p class="text-sm text-slate-400">—</p>
                        }
                    </div>
                    <div class="flex flex-col items-center py-4 gap-0.5">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Total pedido</p>
                        <p class="text-sm font-bold text-[var(--primary-700)]">{{ totalCoste() | number:'1.2-2' }} €</p>
                    </div>
                </div>
            </div>

            <!-- ── Formulario ── -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm mt-3">
                <div class="p-5 sm:p-7">
                    <form [formGroup]="form" class="flex flex-col gap-8">

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <div class="md:col-span-2">
                                <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">Datos del Pedido</p>
                            </div>
                            <app-form-input label="Proveedor" [control]="ctrl('proveedor')" />
                            <app-form-input label="Fecha de entrega estimada" type="date" icon="fa-solid fa-calendar" [control]="ctrl('fechaEntrega')" />
                            <app-form-textarea class="md:col-span-2" label="Observaciones" [control]="ctrl('observaciones')" />
                        </div>

                        <!-- Artículos -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                                    Artículos del Pedido
                                </p>
                                @if (modoEdicion()) {
                                    <button type="button" (click)="agregarItem()"
                                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold
                                               bg-[var(--primary-100)] text-[var(--primary-700)] hover:bg-[var(--primary-200)] transition-colors">
                                        <i class="fa-solid fa-plus text-xs"></i> Agregar
                                    </button>
                                }
                            </div>

                            @if (items.length === 0) {
                                <div class="flex items-center justify-center py-8 rounded-2xl
                                            border-2 border-dashed border-gray-200 text-gray-400 text-sm gap-2">
                                    <i class="fa-solid fa-box-open"></i> Sin artículos
                                </div>
                            }

                            <div class="flex flex-col gap-2">
                                @for (item of items.controls; track $index) {
                                    <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        @if (!modoEdicion()) {
                                            <!-- Vista lectura -->
                                            <div class="flex items-start justify-between gap-3">
                                                <div class="flex items-center gap-2 min-w-0">
                                                    <i class="fa-solid fa-box text-slate-300 text-xs shrink-0 mt-0.5"></i>
                                                    <div class="min-w-0">
                                                        <p class="text-sm font-semibold text-slate-700">
                                                            {{ itemCtrl($index, 'productoNombre').value }}
                                                        </p>
                                                        @if (infoEnvase($index); as env) {
                                                            <p class="text-[11px] text-slate-400 mt-0.5">
                                                                {{ env.cantidad }} {{ env.envaseLabel }}
                                                                @if (env.contenido) {
                                                                    · {{ env.contenido }} {{ env.um }}/{{ env.envaseLabel }}
                                                                    · <span class="font-semibold text-slate-500">{{ env.total | number:'1.0-2' }} {{ env.um }} total</span>
                                                                }
                                                            </p>
                                                        }
                                                    </div>
                                                </div>
                                                <div class="flex flex-col items-end shrink-0 gap-0.5">
                                                    @if (itemCtrl($index, 'precio').value) {
                                                        <span class="text-sm font-bold text-slate-700">
                                                            {{ (itemCtrl($index, 'precio').value * itemCtrl($index, 'cantidad').value) | number:'1.2-2' }} €
                                                        </span>
                                                        <span class="text-[11px] text-slate-400">
                                                            {{ itemCtrl($index, 'precio').value | number:'1.2-2' }} €/ud
                                                        </span>
                                                    }
                                                </div>
                                            </div>
                                        } @else {
                                            <!-- Vista edición -->
                                            <div class="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_40px] gap-3 items-end">
                                                <app-form-multi-select
                                                    label="Producto" [single]="true" [showSearch]="true"
                                                    [options]="nombresProductosFiltrados()"
                                                    [control]="itemCtrl($index, 'productoNombre')"
                                                    (onItemAdded)="onProductoSeleccionado($index, $event)" />
                                                <app-form-input label="Cantidad" type="number" placeholder="1" [control]="itemCtrl($index, 'cantidad')" />
                                                <app-form-input label="Precio/ud (€)" type="number" placeholder="0.00" [control]="itemCtrl($index, 'precio')" />
                                                <button type="button" (click)="eliminarItem($index)"
                                                    class="h-[46px] w-full sm:w-10 rounded-xl bg-red-50 text-red-400
                                                           hover:bg-red-100 transition-colors flex items-center justify-center">
                                                    <i class="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                            @if (infoProductoEdicion($index); as info) {
                                                <div class="flex flex-wrap gap-x-4 gap-y-0.5 px-1 mt-2">
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
                                        }
                                    </div>
                                }
                            </div>

                            <!-- Total -->
                            @if (items.length > 0) {
                                <div class="mt-3 px-4 py-3 bg-[var(--primary-50)] rounded-2xl border border-[var(--primary-100)]
                                            flex items-center justify-between">
                                    <span class="text-sm font-bold text-[var(--primary-700)]">Total del pedido</span>
                                    <span class="text-lg font-black text-[var(--primary-700)]">
                                        {{ totalCoste() | number:'1.2-2' }} €
                                    </span>
                                </div>
                            }
                        </div>
                    </form>
                </div>
            </div>
        }
    `
})
export class ModificarPedidoComponent extends BaseComponent implements OnInit {
    private route     = inject(ActivatedRoute);
    private fb        = inject(FormBuilder);
    private pedidoSvc = inject(PedidoService);
    private provSvc   = inject(ProveedorService);
    private prodSvc   = inject(ProductoService);

    pedido          = signal<Pedido | null>(null);
    cargando        = signal(true);
    modoEdicion     = signal(false);
    guardando       = signal(false);
    cambiandoEstado = signal(false);
    productos       = signal<Producto[]>([]);

    form: FormGroup = this.fb.group({
        proveedor:    [{ value: '', disabled: true }],
        fechaEntrega: [{ value: '', disabled: true }],
        observaciones:[{ value: '', disabled: true }],
        items:        this.fb.array([]),
    });

    get items(): FormArray { return this.form.get('items') as FormArray; }
    ctrl(name: string): FormControl { return this.form.get(name) as FormControl; }
    itemCtrl(i: number, n: string): FormControl { return this.items.at(i).get(n) as FormControl; }

    estadoCfg = () => ESTADO_CFG[this.pedido()?.estado ?? 'PENDIENTE'];

    transiciones = (): { estado: EstadoPedido; label: string; icon: string; btnClass: string }[] => {
        const e = this.pedido()?.estado;
        if (e === 'PENDIENTE') return [
            { estado: 'RECIBIDO',  label: 'Confirmar recepción', icon: 'fa-box-open',    btnClass: 'bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200' },
            { estado: 'CANCELADO', label: 'Cancelar pedido',     icon: 'fa-ban',         btnClass: 'border border-red-200 bg-red-50 hover:bg-red-100 text-red-600' },
        ];
        if (e === 'RECIBIDO') return [
            { estado: 'PAGADO',    label: 'Marcar como pagado',  icon: 'fa-check-double',btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200' },
            { estado: 'CANCELADO', label: 'Cancelar pedido',     icon: 'fa-ban',         btnClass: 'border border-red-200 bg-red-50 hover:bg-red-100 text-red-600' },
        ];
        return [];
    };

    totalCoste = () =>
        (this.pedido()?.items ?? []).reduce(
            (sum, it) => sum + (it.precio ?? 0) * (it.cantidadSolicitada ?? 0), 0
        );

    nombresProductosFiltrados = () => {
        const prov = this.pedido()?.proveedor;
        const lista = prov ? this.productos().filter(p => p.proveedor?.id === prov.id) : this.productos();
        return lista.map(p => p.nombre);
    };

    infoProductoEdicion(i: number): { stock: string; stockMinimo: string; envase: string | null } | null {
        const nombre = this.itemCtrl(i, 'productoNombre').value as string;
        if (!nombre) return null;
        const prod = this.productos().find(p => p.nombre === nombre);
        if (!prod) return null;
        const um = UM_ABREV[prod.unidadMedida] ?? prod.unidadMedida;
        return {
            stock:       `${prod.stockActual.toFixed(2)} ${um}`,
            stockMinimo: `${prod.stockMinimo.toFixed(2)} ${um}`,
            envase: prod.contenidoPorUnidad
                ? `${prod.contenidoPorUnidad} ${um} / ${ENVASE_LABEL[prod.envase ?? ''] ?? (prod.envase?.toLowerCase() ?? 'ud')}`
                : null,
        };
    }

    infoEnvase(i: number): { cantidad: number; envaseLabel: string; contenido: number; um: string; total: number } | null {
        const p = this.pedido();
        if (!p?.items?.[i]) return null;
        const item = p.items[i] as any;
        const cantidad = item.cantidadSolicitada ?? 0;
        const contenido = item.contenidoPorUnidad ?? 0;
        const um = item.unidadMedida ? (UM_ABREV[item.unidadMedida] ?? item.unidadMedida) : '';
        const envaseLabel = item.envase ? (ENVASE_LABEL[item.envase] ?? item.envase.toLowerCase()) : 'ud';
        return { cantidad, envaseLabel, contenido, um, total: cantidad * contenido };
    }

    ngOnInit() {
        this.prodSvc.getAll().subscribe(d => this.productos.set(d));
        this.provSvc.getAll().subscribe();
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.pedidoSvc.getById(id).subscribe({
            next:  p  => { this.pedido.set(p); this.rellenarForm(p); this.cargando.set(false); },
            error: () => { this.notif.error('Error al cargar el pedido', 'Error'); this.cargando.set(false); },
        });
    }

    private rellenarForm(p: Pedido) {
        this.form.patchValue({
            proveedor:    p.proveedor?.nombre ?? '',
            fechaEntrega: p.fechaEntrega ? p.fechaEntrega.substring(0, 10) : '',
            observaciones:p.observaciones ?? '',
        });
        while (this.items.length) this.items.removeAt(0);
        (p.items ?? []).forEach((it: any) => {
            this.items.push(this.fb.group({
                productoNombre: [{ value: it.productoNombre, disabled: true }, Validators.required],
                cantidad:       [{ value: it.cantidadSolicitada, disabled: true }, [Validators.required, Validators.min(0.01)]],
                precio:         [{ value: it.precio, disabled: true }, Validators.min(0)],
                productoId:     [it.productoId],
            }));
        });
    }

    activarEdicion() {
        this.modoEdicion.set(true);
        this.form.enable();
        this.ctrl('proveedor').disable();
        this.items.controls.forEach(g => {
            g.get('productoNombre')?.enable();
            g.get('cantidad')?.enable();
            g.get('precio')?.enable();
        });
    }

    cancelarEdicion() {
        this.modoEdicion.set(false);
        this.rellenarForm(this.pedido()!);
        this.form.disable();
    }

    agregarItem() {
        this.items.push(this.fb.group({
            productoNombre: ['', Validators.required],
            cantidad:       [1,  [Validators.required, Validators.min(0.01)]],
            precio:         [0,  Validators.min(0)],
            productoId:     [null],
        }));
    }

    eliminarItem(i: number) { this.items.removeAt(i); }

    onProductoSeleccionado(i: number, nombre: string) {
        const prod = this.productos().find(p => p.nombre === nombre);
        if (prod) {
            this.itemCtrl(i, 'productoId').setValue(prod.id);
            if (prod.precio != null) this.itemCtrl(i, 'precio').setValue(prod.precio);
        }
    }

    guardar() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        const p = this.pedido()!;
        const itemsPayload = this.items.controls
            .map(c => ({
                productoId:         c.get('productoId')?.value,
                cantidadSolicitada: c.get('cantidad')?.value,
                precio:             c.get('precio')?.value ?? 0,
            }))
            .filter(it => it.productoId);

        const payload: any = {
            proveedorId:   p.proveedor.id,
            fechaEntrega:  this.ctrl('fechaEntrega').value ? `${this.ctrl('fechaEntrega').value}T00:00:00` : null,
            observaciones: this.ctrl('observaciones').value || null,
            items:         itemsPayload,
            estado:        p.estado,
        };

        this.guardando.set(true);
        this.pedidoSvc.update(p.id, payload).subscribe({
            next: updated => {
                this.pedido.set(updated);
                this.rellenarForm(updated);
                this.modoEdicion.set(false);
                this.form.disable();
                this.notif.info('Pedido actualizado', 'Pedido');
                this.guardando.set(false);
            },
            error: () => { this.notif.error('Error al guardar', 'Error'); this.guardando.set(false); },
        });
    }

    cambiarEstado(estado: EstadoPedido) {
        this.cambiandoEstado.set(true);
        this.pedidoSvc.cambiarEstado(this.pedido()!.id, estado).subscribe({
            next: updated => {
                this.pedido.set(updated);
                this.notif.info(`Pedido ${ESTADO_CFG[estado].label.toLowerCase()}`, 'Pedido');
                this.cambiandoEstado.set(false);
            },
            error: () => { this.notif.error('Error al cambiar estado', 'Error'); this.cambiandoEstado.set(false); },
        });
    }

    formatFecha(fecha?: string): string {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    colorEntrega(fecha: string): string {
        const dias = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
        if (dias < 0)  return 'text-red-500';
        if (dias <= 1) return 'text-orange-500';
        return 'text-slate-700';
    }
}
