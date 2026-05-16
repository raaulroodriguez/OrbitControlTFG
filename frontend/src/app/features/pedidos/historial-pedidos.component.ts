import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { FilterSelectComponent, FilterOption } from '../../shared/search/filter-select.component';
import { EstadoPedido, Pedido } from '../../core/models/pedido.model';
import { PedidoService } from '../../core/services/pedido.service';
import { BaseComponent } from '../../core/base/base.component';

type FiltroEstado = 'TODOS' | EstadoPedido;

const ESTADO_CFG: Record<EstadoPedido, { label: string; icon: string; bg: string; text: string; gradient: string }> = {
    BORRADOR:  { label: 'Borrador',   icon: 'fa-pencil',       bg: 'bg-amber-100',   text: 'text-amber-700',   gradient: 'from-amber-400 to-amber-600'    },
    PENDIENTE: { label: 'Pendiente',  icon: 'fa-clock',        bg: 'bg-blue-100',    text: 'text-blue-700',    gradient: 'from-blue-500 to-blue-700'      },
    RECIBIDO:  { label: 'Recibido',   icon: 'fa-box-open',     bg: 'bg-green-100',   text: 'text-green-700',   gradient: 'from-green-500 to-green-700'    },
    PAGADO:    { label: 'Pagado',     icon: 'fa-check-circle', bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-600 to-emerald-800' },
    CANCELADO: { label: 'Cancelado',  icon: 'fa-ban',          bg: 'bg-slate-100',   text: 'text-slate-600',   gradient: 'from-slate-400 to-slate-600'    },
};

@Component({
    selector: 'app-historial-pedidos',
    standalone: true,
    imports: [SectionHeaderComponent, FormsModule, DecimalPipe, FilterSelectComponent],
    template: `
        <app-section-header
            title="Historial de Pedidos"
            subtitle="Todos los pedidos del sistema"
            icon="fas fa-clock-rotate-left">
        </app-section-header>

        <div class="flex flex-col sm:flex-row gap-2 mt-4 mb-2">
            <input type="text" [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)"
                placeholder="Buscar proveedor o código..."
                class="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"/>
            <app-filter-select
                placeholder="Estado"
                [options]="filtroOpciones"
                (valueChange)="setFiltro($event)"/>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
            @for (p of pedidos(); track p.id) {
                <div (click)="abrirDetalle(p)"
                     class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer
                            hover:border-[var(--primary-200)] hover:shadow-md transition-all">

                    <div class="px-4 pt-4 pb-5 bg-gradient-to-br {{ estadoCfg(p.estado).gradient }}">
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
                            @if (p.estado === 'PENDIENTE') {
                                <p class="text-[11px] text-slate-400">Entrega esperada</p>
                                <p class="text-sm font-semibold text-blue-500">{{ formatFecha(p.fechaEntrega) }}</p>
                            } @else if (p.estado === 'RECIBIDO' || p.estado === 'PAGADO') {
                                <p class="text-[11px] text-slate-400">Recibido</p>
                                <p class="text-sm font-semibold text-green-600">{{ formatFecha(p.fechaRecibido) }}</p>
                            } @else {
                                <p class="text-[11px] text-slate-400">Entrega prevista</p>
                                <p class="text-sm font-semibold text-slate-400">{{ formatFecha(p.fechaEntrega) }}</p>
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
                            {{ p.items.length }} artículo{{ p.items.length !== 1 ? 's' : '' }}
                        </p>
                        @if (p.items.length) {
                            <p class="text-sm font-bold text-[var(--primary-700)]">
                                {{ costeTotal(p) | number:'1.2-2' }} €
                            </p>
                        }
                    </div>
                </div>
            }
        </div>

        @if (!cargando() && pedidos().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 gap-3">
                <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <i class="fa-solid fa-clock-rotate-left text-2xl text-slate-400"></i>
                </div>
                <p class="text-slate-700 font-semibold">Sin resultados</p>
                <p class="text-sm text-slate-400">No hay pedidos con los filtros aplicados</p>
            </div>
        }

        <!-- Modal detalle -->
        @if (pedidoDetalle()) {
            <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                 (click)="cerrarDetalle()">
                <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]"
                     (click)="$event.stopPropagation()">

                    <div class="rounded-t-2xl bg-gradient-to-br {{ estadoCfg(pedidoDetalle()!.estado).gradient }} p-5">
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

                    <div class="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                        <div class="flex flex-col items-center py-3 gap-0.5">
                            <p class="text-[11px] text-slate-400">Pedido</p>
                            <p class="text-sm font-semibold text-slate-700">{{ formatFecha(pedidoDetalle()!.fechaPedido) }}</p>
                        </div>
                        <div class="flex flex-col items-center py-3 gap-0.5">
                            @if (pedidoDetalle()!.estado === 'PENDIENTE') {
                                <p class="text-[11px] text-slate-400">Entrega esperada</p>
                                <p class="text-sm font-semibold text-blue-500">{{ formatFecha(pedidoDetalle()!.fechaEntrega) }}</p>
                            } @else if (pedidoDetalle()!.fechaRecibido) {
                                <p class="text-[11px] text-slate-400">Recibido</p>
                                <p class="text-sm font-semibold text-green-600">{{ formatFecha(pedidoDetalle()!.fechaRecibido) }}</p>
                            } @else {
                                <p class="text-[11px] text-slate-400">Entrega prevista</p>
                                <p class="text-sm text-slate-400">{{ formatFecha(pedidoDetalle()!.fechaEntrega) }}</p>
                            }
                        </div>
                    </div>

                    @if (pedidoDetalle()!.observaciones) {
                        <div class="px-5 py-3 border-b border-slate-100">
                            <p class="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Observaciones</p>
                            <p class="text-sm text-slate-600">{{ pedidoDetalle()!.observaciones }}</p>
                        </div>
                    }

                    <div class="px-5 py-4 overflow-y-auto flex flex-col gap-2 flex-1">
                        <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-500)] mb-1">
                            Artículos ({{ pedidoDetalle()!.items.length }})
                        </p>
                        @if (!pedidoDetalle()!.items.length) {
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
                        @if (pedidoDetalle()!.items.length) {
                            <div class="flex items-center justify-between px-3 py-2.5 bg-[var(--primary-50)]
                                        rounded-xl border border-[var(--primary-100)] mt-1">
                                <span class="text-xs font-bold text-[var(--primary-700)]">Total</span>
                                <span class="text-base font-black text-[var(--primary-700)]">
                                    {{ totalCosteDetalle() | number:'1.2-2' }} €
                                </span>
                            </div>
                        }
                    </div>

                    <div class="px-5 py-4 border-t border-slate-100 flex flex-col gap-2">
                        @if (pedidoDetalle()!.estado === 'PENDIENTE') {
                            <div class="flex gap-2">
                                <button (click)="cambiarEstado(pedidoDetalle()!, 'RECIBIDO')"
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
    `
})
export class HistorialPedidosComponent extends BaseComponent implements OnInit {
    private pedidoService = inject(PedidoService);

    todos         = signal<Pedido[]>([]);
    cargando      = signal(true);
    busqueda      = signal('');
    filtroEstado  = signal<FiltroEstado>('TODOS');
    pedidoDetalle = signal<Pedido | null>(null);
    procesando    = signal(false);

    setFiltro(v: string) { this.filtroEstado.set((v || 'TODOS') as FiltroEstado); }

    readonly filtroOpciones: FilterOption[] = [
        { value: 'PENDIENTE', label: 'Pendientes'  },
        { value: 'RECIBIDO',  label: 'Recibidos'   },
        { value: 'PAGADO',    label: 'Pagados'     },
        { value: 'CANCELADO', label: 'Cancelados'  },
        { value: 'BORRADOR',  label: 'Borradores'  },
    ];

    pedidos = computed(() => {
        let lista = this.todos();
        if (this.filtroEstado() !== 'TODOS')
            lista = lista.filter(p => p.estado === this.filtroEstado());
        const q = this.busqueda().trim().toLowerCase();
        if (q)
            lista = lista.filter(p =>
                p.proveedor.nombre.toLowerCase().includes(q) ||
                (p.codigoPedido ?? '').toLowerCase().includes(q)
            );
        return lista;
    });

    ngOnInit() {
        this.pedidoService.getAll().subscribe({
            next:  res => { this.todos.set(res); this.cargando.set(false); },
            error: ()  => { this.notif.error('Error al cargar el historial', 'Error'); this.cargando.set(false); }
        });
    }

    abrirDetalle(p: Pedido)  { this.pedidoDetalle.set(p); }
    cerrarDetalle()          { this.pedidoDetalle.set(null); }

    cambiarEstado(p: Pedido, estado: EstadoPedido) {
        this.procesando.set(true);
        this.pedidoService.cambiarEstado(p.id, estado).subscribe({
            next: updated => {
                this.todos.update(list => list.map(x => x.id === updated.id ? updated : x));
                this.pedidoDetalle.set(updated);
                this.notif.info(`Pedido ${ESTADO_CFG[estado].label.toLowerCase()}`, 'Pedido');
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
        return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
    }
}
