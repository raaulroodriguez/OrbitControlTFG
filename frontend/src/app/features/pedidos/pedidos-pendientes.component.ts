import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { NgTemplateOutlet, DecimalPipe } from '@angular/common';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ToolbarButtonComponent } from '../../shared/section-header/toolbar-button.component';
import { EstadoPedido, Pedido } from '../../core/models/pedido.model';
import { PedidoService } from '../../core/services/pedido.service';
import { LoteService } from '../../core/services/lote.service';
import { BaseComponent } from '../../core/base/base.component';
import { forkJoin, of } from 'rxjs';

const ESTADO_CFG: Record<EstadoPedido, { label: string; icon: string; bg: string; text: string; gradient: string }> = {
    BORRADOR:  { label: 'Borrador',   icon: 'fa-pencil',       bg: 'bg-amber-100',   text: 'text-amber-700',   gradient: 'from-amber-400 to-amber-600'    },
    PENDIENTE: { label: 'Pendiente',  icon: 'fa-clock',        bg: 'bg-blue-100',    text: 'text-blue-700',    gradient: 'from-blue-500 to-blue-700'      },
    RECIBIDO:  { label: 'Recibido',   icon: 'fa-box-open',     bg: 'bg-green-100',   text: 'text-green-700',   gradient: 'from-green-500 to-green-700'    },
    PAGADO:    { label: 'Pagado',     icon: 'fa-check-circle', bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-600 to-emerald-800' },
    CANCELADO: { label: 'Cancelado',  icon: 'fa-ban',          bg: 'bg-slate-100',   text: 'text-slate-600',   gradient: 'from-slate-400 to-slate-600'    },
};

@Component({
    selector: 'app-pedidos-pendientes',
    standalone: true,
    imports: [SectionHeaderComponent, ToolbarButtonComponent, NgTemplateOutlet, DecimalPipe],
    template: `
        <app-section-header
            title="Pedidos Pendientes"
            subtitle="Entregas y pagos pendientes"
            icon="fas fa-clock">
            @if (auth.hasPermission()) {
                <app-toolbar-button toolbar text="Nuevo pedido" icon="fa-solid fa-plus"
                    (click)="router.navigate(['/pedidos/nuevo'])"/>
            }
        </app-section-header>

        <!-- Pendientes de entrega -->
        @if (pendientesEntrega().length > 0) {
            <div class="flex flex-col items-center gap-1 mt-6 mb-3">
                <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d1fae5] border border-[#6ee7b7] text-[#065f46] text-sm font-semibold">
                    <i class="fa-solid fa-truck text-xs"></i>
                     PENDIENTES DE ENTREGA ({{ pendientesEntrega().length }}) 
                </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                @for (p of pendientesEntrega(); track p.id) {
                    <ng-container *ngTemplateOutlet="pedidoCard; context: { p }"></ng-container>
                }
            </div>
        }

        <!-- Pendientes de pago -->
        @if (pendientesPago().length > 0) {
            <div class="flex flex-col items-center gap-1 mt-8 mb-3">
                <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d1fae5] border border-[#6ee7b7] text-[#065f46] text-sm font-semibold">
                    <i class="fa-solid fa-file-invoice-dollar text-xs"></i>
                    PENDIENTES DE PAGO ({{ pendientesPago().length }})
                </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                @for (p of pendientesPago(); track p.id) {
                    <ng-container *ngTemplateOutlet="pedidoCard; context: { p }"></ng-container>
                }
            </div>
        }

        @if (!cargando() && pendientesEntrega().length === 0 && pendientesPago().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 gap-3">
                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <i class="fa-solid fa-check text-2xl text-green-600"></i>
                </div>
                <p class="text-slate-700 font-semibold">Todo al día</p>
                <p class="text-sm text-slate-400">No hay pedidos pendientes de entrega ni de pago</p>
            </div>
        }

        <!-- Borradores (solo ADMIN / ENCARGADO) -->
        @if (esAdminOEncargado() && borradores().length > 0) {
            <div class="mt-10">
                <div class="flex flex-col items-center gap-1 mb-3">
                    <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-sm font-semibold">
                        <i class="fa-solid fa-pencil text-xs"></i>
                        BORRADOR{{ borradores().length !== 1 ? 'ES' : '' }} GUARDADO{{ borradores().length !== 1 ? 'S' : '' }} ({{ borradores().length }}) 
                    </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    @for (b of borradores(); track b.id) {
                        <div class="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                            <div class="bg-gradient-to-br from-amber-400 to-amber-600 px-4 pt-4 pb-5">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex items-center gap-2.5 min-w-0">
                                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                            <i class="fa-solid fa-pencil text-white text-xs"></i>
                                        </div>
                                        <div class="min-w-0">
                                            <p class="font-bold text-white text-sm truncate">{{ b.proveedor.nombre }}</p>
                                            <p class="text-white/60 text-[11px]">Borrador sin enviar</p>
                                        </div>
                                    </div>
                                    <span class="shrink-0 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                                        Borrador
                                    </span>
                                </div>
                            </div>
                            <div class="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                                <p class="text-[11px] text-slate-400">
                                    <i class="fa-solid fa-clock mr-1"></i>{{ formatFecha(b.fechaPedido) }}
                                    &nbsp;·&nbsp;
                                    <i class="fa-solid fa-boxes-stacked mr-1"></i>{{ (b?.items?.length ?? 0) }} artículo{{ (b?.items?.length ?? 0) !== 1 ? 's' : '' }}
                                </p>
                                @if (b?.items?.length) {
                                    <p class="text-sm font-bold text-amber-700">{{ costeTotal(b) | number:'1.2-2' }} €</p>
                                }
                            </div>
                            <div class="px-4 py-3 flex gap-2">
                                <button (click)="continuarBorrador(b)"
                                    class="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold
                                           transition-colors flex items-center justify-center gap-1.5">
                                    <i class="fa-solid fa-pen-to-square text-xs"></i> Continuar
                                </button>
                                <button (click)="eliminarBorrador(b)"
                                    [disabled]="eliminando() === b.id"
                                    class="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold
                                           transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                    @if (eliminando() === b.id) {
                                        <i class="fa-solid fa-spinner fa-spin text-xs"></i>
                                    } @else {
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    }
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        }

        <!-- Card template -->
        <ng-template #pedidoCard let-p="p">
            <div (click)="abrirDetalle(p)"
                 class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer
                        hover:border-[var(--primary-200)] hover:shadow-md transition-all">
                <div class="bg-gradient-to-br {{ estadoCfg(p.estado).gradient }} px-4 pt-4 pb-5">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <i class="fa-solid {{ iconoPorTipo(p.tipoProductoPedido) }} text-white text-xs"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="font-bold text-white text-sm truncate">{{ p.proveedor.nombre }}</p>
                                <p class="text-white/60 text-[11px] font-mono">{{ p.codigoPedido ?? '—' }}</p>
                            </div>
                        </div>
                        <span class="shrink-0 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                            {{ estadoCfg(p.estado).label }}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                    <div class="flex flex-col items-center py-3 gap-0.5">
                        <p class="text-[11px] text-slate-400">Pedido</p>
                        <p class="text-sm font-semibold text-slate-700">{{ formatFecha(p.fechaPedido) }}</p>
                    </div>
                    <div class="flex flex-col items-center py-3 gap-0.5">
                        <p class="text-[11px] text-slate-400">Entrega esperada</p>
                        @if (p.fechaEntrega) {
                            <p class="text-sm font-semibold" [class]="colorEntrega(p.fechaEntrega)">{{ formatFecha(p.fechaEntrega) }}</p>
                            <p class="text-[11px]" [class]="colorEntrega(p.fechaEntrega)">{{ diasLabel(p.fechaEntrega) }}</p>
                        } @else {
                            <p class="text-sm text-slate-400">—</p>
                        }
                    </div>
                </div>

                @if (p.observaciones) {
                    <div class="px-4 py-2 border-b border-slate-100">
                        <p class="text-xs text-slate-500 truncate">
                            <i class="fa-solid fa-note-sticky text-slate-300 mr-1"></i>{{ p.observaciones }}
                        </p>
                    </div>
                }

                <div class="px-4 py-3 flex items-center justify-between">
                    <p class="text-[11px] text-slate-400">
                        <i class="fa-solid fa-boxes-stacked mr-1"></i>
                        {{ (p.items?.length ?? 0) }} artículo{{ (p.items?.length ?? 0) !== 1 ? 's' : '' }}
                    </p>
                    @if (p.items?.length) {
                        <p class="text-sm font-bold text-[var(--primary-700)]">
                            {{ costeTotal(p) | number:'1.2-2' }} €
                        </p>
                    }
                </div>
            </div>
        </ng-template>

        <!-- Modal detalle -->
        @if (pedidoDetalle()) {
            <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                 (click)="cerrarDetalle()">
                <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]"
                     (click)="$event.stopPropagation()">

                    <!-- Header -->
                    <div class="relative rounded-t-2xl bg-gradient-to-br {{ estadoCfg(pedidoDetalle()!.estado).gradient }} p-5">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                                    <i class="fa-solid {{ iconoPorTipo(pedidoDetalle()!.tipoProductoPedido) }} text-white text-lg"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="font-bold text-white text-base truncate">{{ pedidoDetalle()!.proveedor.nombre }}</p>
                                    <p class="text-white/60 text-xs font-mono">{{ pedidoDetalle()!.codigoPedido ?? '—' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                                <span class="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-sm">
                                    {{ estadoCfg(pedidoDetalle()!.estado).label }}
                                </span>
                                <button (click)="cerrarDetalle()"
                                    class="w-8 h-8 flex items-center justify-center rounded-xl
                                           bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-colors">
                                    <i class="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Fechas -->
                    <div class="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                        <div class="flex flex-col items-center py-3 gap-0.5">
                            <p class="text-[11px] text-slate-400">Pedido</p>
                            <p class="text-sm font-semibold text-slate-700">{{ formatFecha(pedidoDetalle()!.fechaPedido) }}</p>
                        </div>
                        <div class="flex flex-col items-center py-3 gap-0.5">
                            @if (pedidoDetalle()!.fechaEntrega) {
                                <p class="text-[11px] text-slate-400">Entrega esperada</p>
                                <p class="text-sm font-semibold" [class]="colorEntrega(pedidoDetalle()!.fechaEntrega!)">
                                    {{ formatFecha(pedidoDetalle()!.fechaEntrega) }}
                                </p>
                            } @else if (pedidoDetalle()!.fechaRecibido) {
                                <p class="text-[11px] text-slate-400">Recibido</p>
                                <p class="text-sm font-semibold text-green-600">{{ formatFecha(pedidoDetalle()!.fechaRecibido) }}</p>
                            } @else {
                                <p class="text-[11px] text-slate-400">Fecha entrega</p>
                                <p class="text-sm text-slate-400">—</p>
                            }
                        </div>
                    </div>

                    <!-- Observaciones -->
                    @if (pedidoDetalle()!.observaciones) {
                        <div class="px-5 py-3 border-b border-slate-100">
                            <p class="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Observaciones</p>
                            <p class="text-sm text-slate-600">{{ pedidoDetalle()!.observaciones }}</p>
                        </div>
                    }

                    <!-- Artículos -->
                    <div class="px-5 py-4 overflow-y-auto flex flex-col gap-2 flex-1">
                        <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-500)] mb-1">
                            Artículos ({{ pedidoDetalle()?.items?.length ?? 0 }})
                        </p>
                        @if (!pedidoDetalle()?.items?.length) {
                            <p class="text-sm text-slate-400 text-center py-4">Sin artículos registrados</p>
                        }
                        @for (item of pedidoDetalle()!.items; track item.id) {
                            <div class="flex items-start justify-between py-2.5 px-3 rounded-xl border border-gray-100 bg-gray-50 gap-3">
                                <div class="flex items-start gap-2 min-w-0">
                                    <i class="fa-solid fa-box text-[var(--primary-400)] text-xs mt-1 shrink-0"></i>
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium text-slate-700">{{ item.productoNombre }}</p>
                                        @if (item.contenidoPorUnidad) {
                                            <p class="text-[11px] text-slate-400">
                                                {{ item.cantidadSolicitada }} {{ item.envase?.toLowerCase() ?? 'ud' }}
                                                · {{ item.contenidoPorUnidad }} {{ umAbrev(item.unidadMedida) }}/ud
                                                · <span class="font-semibold text-slate-500">{{ (item.cantidadSolicitada * item.contenidoPorUnidad) | number:'1.0-2' }} {{ umAbrev(item.unidadMedida) }}</span>
                                            </p>
                                        } @else {
                                            <p class="text-[11px] text-slate-400">× {{ item.cantidadSolicitada }}</p>
                                        }
                                    </div>
                                </div>
                                @if (item.precio) {
                                    <div class="text-right shrink-0">
                                        <p class="text-sm font-bold text-slate-700">{{ (item.precio * item.cantidadSolicitada) | number:'1.2-2' }} €</p>
                                        <p class="text-[11px] text-slate-400">{{ item.precio | number:'1.2-2' }} €/ud</p>
                                    </div>
                                }
                            </div>
                        }
                        <!-- Total -->
                        @if (pedidoDetalle()?.items?.length) {
                            <div class="flex items-center justify-between px-3 py-2.5 bg-[var(--primary-50)]
                                        rounded-xl border border-[var(--primary-100)] mt-1">
                                <span class="text-xs font-bold text-[var(--primary-700)]">Total</span>
                                <span class="text-base font-black text-[var(--primary-700)]">
                                    {{ totalCosteDetalle() | number:'1.2-2' }} €
                                </span>
                            </div>
                        }
                    </div>

                    <!-- Acciones -->
                    <div class="px-5 py-4 border-t border-slate-100 flex flex-col gap-2">
                        @if (pedidoDetalle()!.estado === 'PENDIENTE') {
                            <div class="flex gap-2">
                                <button (click)="abrirModalLotes()"
                                    [disabled]="procesando()"
                                    class="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold
                                           transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                    @if (procesando()) { <i class="fa-solid fa-spinner fa-spin text-xs"></i> }
                                    @else { <i class="fa-solid fa-box-open text-xs"></i> }
                                    Marcar recibido
                                </button>
                                <button (click)="cambiarEstado(pedidoDetalle()!, 'CANCELADO')"
                                    [disabled]="procesando()"
                                    class="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold
                                           transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                    <i class="fa-solid fa-ban text-xs"></i> Cancelar
                                </button>
                            </div>
                        } @else if (pedidoDetalle()!.estado === 'RECIBIDO') {
                            <div class="flex gap-2">
                                <button (click)="cambiarEstado(pedidoDetalle()!, 'PAGADO')"
                                    [disabled]="procesando()"
                                    class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold
                                           transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                    @if (procesando()) { <i class="fa-solid fa-spinner fa-spin text-xs"></i> }
                                    @else { <i class="fa-solid fa-check text-xs"></i> }
                                    Marcar pagado
                                </button>
                                <button (click)="cambiarEstado(pedidoDetalle()!, 'CANCELADO')"
                                    [disabled]="procesando()"
                                    class="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold
                                           transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                    <i class="fa-solid fa-ban text-xs"></i> Cancelar
                                </button>
                            </div>
                        }
                        <button (click)="router.navigate(['/pedidos/detalles', pedidoDetalle()!.id])"
                            class="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold
                                   hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-pen-to-square text-xs"></i> Ver detalle completo / Editar
                        </button>
                    </div>
                </div>
            </div>
        }

        <!-- Modal lotes al recibir -->
        @if (modalLotes()) {
            <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]">
                    <div class="bg-gradient-to-br from-green-500 to-green-700 p-5 rounded-t-2xl flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <i class="fa-solid fa-calendar-days text-white"></i>
                            </div>
                            <div>
                                <p class="font-bold text-white text-sm">Registrar fechas de caducidad</p>
                                <p class="text-white/60 text-[11px]">Opcional — puedes dejarlo en blanco</p>
                            </div>
                        </div>
                        <button (click)="cerrarModalLotes()"
                            class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                    </div>

                    <div class="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-3">
                        @for (item of pedidoDetalle()!.items; track item.id) {
                            <div class="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50">
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-box text-[var(--primary-400)] text-xs"></i>
                                    <p class="text-sm font-medium text-slate-700">{{ item.productoNombre }}</p>
                                    <span class="ml-auto text-[11px] text-slate-400">
                                        {{ item.contenidoPorUnidad
                                            ? ((item.cantidadSolicitada * item.contenidoPorUnidad) | number:'1.0-2') + ' ' + umAbrev(item.unidadMedida)
                                            : item.cantidadSolicitada + ' ud' }}
                                    </span>
                                </div>
                                <input type="date"
                                    [value]="fechasCaducidad[item.productoId] ?? ''"
                                    (change)="setFechaCaducidad(item.productoId, $any($event.target).value)"
                                    class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white
                                           text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-300"/>
                            </div>
                        }
                    </div>

                    <div class="px-5 py-4 border-t border-slate-100 flex gap-2">
                        <button (click)="confirmarRecibido()"
                            [disabled]="guardandoLotes()"
                            class="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold
                                   transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                            @if (guardandoLotes()) { <i class="fa-solid fa-spinner fa-spin text-xs"></i> }
                            @else { <i class="fa-solid fa-box-open text-xs"></i> }
                            Confirmar recibido
                        </button>
                        <button (click)="cerrarModalLotes()"
                            class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold
                                   hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        }
    `
})
export class PedidosPendientesComponent extends BaseComponent implements OnInit {
    private pedidoService = inject(PedidoService);
    private loteService   = inject(LoteService);

    todos         = signal<Pedido[]>([]);
    borradores    = signal<Pedido[]>([]);
    cargando      = signal(true);
    procesando    = signal(false);
    eliminando    = signal<number | null>(null);
    pedidoDetalle = signal<Pedido | null>(null);
    modalLotes    = signal(false);
    guardandoLotes = signal(false);
    fechasCaducidad: Record<number, string | undefined> = {};

    esAdminOEncargado = () => this.auth.hasRole('ROLE_ADMIN', 'ROLE_ENCARGADO');

    pendientesEntrega = computed(() => this.todos().filter(p => p.estado === 'PENDIENTE'));
    pendientesPago    = computed(() => this.todos().filter(p => p.estado === 'RECIBIDO'));

    ngOnInit() {
        this.pedidoService.getAll().subscribe({
            next:  res => { this.todos.set(res); this.cargando.set(false); },
            error: ()  => { this.notif.error('Error al cargar los pedidos', 'Error'); this.cargando.set(false); }
        });
        if (this.esAdminOEncargado()) {
            this.pedidoService.getBorradores().subscribe({
                next: res => this.borradores.set(res),
                error: ()  => {}
            });
        }
    }

    abrirDetalle(p: Pedido)  { this.pedidoDetalle.set(p); }
    cerrarDetalle()          { this.pedidoDetalle.set(null); }

    abrirModalLotes() {
        this.fechasCaducidad = {};
        this.modalLotes.set(true);
    }

    cerrarModalLotes() { this.modalLotes.set(false); }

    setFechaCaducidad(productoId: number, fecha: string) {
        if (fecha) this.fechasCaducidad[productoId] = fecha;
        else delete this.fechasCaducidad[productoId];
    }

    // Crea un lote por cada producto que tenga fecha de caducidad registrada.
    // Espera a que todos los lotes estén guardados (forkJoin) y luego cambia el
    // estado del pedido a RECIBIDO. Si no hay fechas, salta directamente al cambio de estado.
    confirmarRecibido() {
        const pedido = this.pedidoDetalle()!;
        const hoy = new Date().toISOString().slice(0, 19);
        const lotes$ = pedido.items
            .filter(item => this.fechasCaducidad[item.productoId])
            .map(item => this.loteService.create({
                tipoEntidad: 'PRODUCTO',
                entidadId:   item.productoId,
                cantidad:    item.contenidoPorUnidad
                    ? item.cantidadSolicitada * item.contenidoPorUnidad
                    : item.cantidadSolicitada,
                fechaCaducidad: this.fechasCaducidad[item.productoId] + 'T00:00:00',
                fechaEntrada:   hoy,
                pedidoId:       pedido.id,
            }));

        this.guardandoLotes.set(true);
        const obs$ = lotes$.length > 0 ? forkJoin(lotes$) : of([]);
        obs$.subscribe({
            next: () => {
                this.guardandoLotes.set(false);
                this.modalLotes.set(false);
                this.cambiarEstado(pedido, 'RECIBIDO');
            },
            error: () => {
                this.notif.error('Error al registrar lotes', 'Error');
                this.guardandoLotes.set(false);
            }
        });
    }

    continuarBorrador(b: Pedido) {
        this.router.navigate(['/pedidos/nuevo'], { state: { borrador: b } });
    }

    eliminarBorrador(b: Pedido) {
        this.eliminando.set(b.id);
        this.pedidoService.delete(b.id).subscribe({
            next: () => {
                this.borradores.update(list => list.filter(x => x.id !== b.id));
                this.notif.info('Borrador eliminado', 'Borrador');
                this.eliminando.set(null);
            },
            error: () => { this.notif.error('Error al eliminar el borrador', 'Error'); this.eliminando.set(null); }
        });
    }

    // Actualiza el estado en el servidor y reemplaza la entrada en la lista local
    // para reflejar el cambio sin recargar toda la página.
    cambiarEstado(p: Pedido, estado: EstadoPedido) {
        this.procesando.set(true);
        this.pedidoService.cambiarEstado(p.id, estado).subscribe({
            next: updated => {
                this.todos.update(list => list.map(x => x.id === updated.id ? updated : x));
                this.pedidoDetalle.set(updated);
                this.notif.info(`Pedido ${this.estadoCfg(estado).label.toLowerCase()}`, 'Pedido');
                this.procesando.set(false);
            },
            error: () => { this.notif.error('Error al cambiar estado', 'Error'); this.procesando.set(false); }
        });
    }

    estadoCfg(estado: EstadoPedido) { return ESTADO_CFG[estado]; }

    totalCosteDetalle() {
        return (this.pedidoDetalle()?.items ?? []).reduce(
            (s, i: any) => s + (i.precio ?? 0) * (i.cantidadSolicitada ?? 0), 0
        );
    }

    costeTotal(p: Pedido): number {
        return (p.items ?? []).reduce((s, i: any) => s + (i.precio ?? 0) * (i.cantidadSolicitada ?? 0), 0);
    }

    umAbrev(um?: string): string {
        const map: Record<string, string> = { KILOGRAMO:'kg', GRAMO:'g', LITRO:'L', MILILITRO:'ml', UNIDAD:'ud', DOCENA:'doc' };
        return um ? (map[um] ?? um) : '';
    }

    iconoPorTipo(tipo?: string): string {
        if (tipo === 'OBRADOR') return 'fa-utensils';
        if (tipo === 'TIENDA')  return 'fa-shop';
        return 'fa-boxes-stacked';
    }

    formatFecha(fecha?: string): string {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }

    // Convierte la diferencia en ms a texto legible: "hace Xd", "hoy", "mañana" o "en X días".
    diasLabel(fecha: string): string {
        const dias = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
        if (dias < 0)   return `hace ${Math.abs(dias)}d`;
        if (dias === 0) return 'hoy';
        if (dias === 1) return 'mañana';
        return `en ${dias} días`;
    }

    // Colorea la fecha según urgencia: rojo si ya venció, naranja si es inminente (≤1 día).
    colorEntrega(fecha: string): string {
        const dias = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000);
        if (dias < 0)  return 'text-red-500';
        if (dias <= 1) return 'text-orange-500';
        return 'text-green-600';
    }
}
