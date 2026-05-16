import { Component, OnInit, DestroyRef, signal, inject, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { RecetaService, RecetaPageResponse } from '../../../core/services/receta.service';
import { Receta } from '../../../core/models/helado.model';
import { IngredienteReceta } from '../../../core/models/producto.model';
import { TableComponent } from '../../../shared/table/table.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { ToolbarButtonComponent } from '../../../shared/section-header/toolbar-button.component';
import { ThComponent } from '../../../shared/table/table-th.component';
import { ThSortComponent } from '../../../shared/table/table-th-sort.component';
import { TdComponent } from '../../../shared/table/table-td.component';
import { CardComponent } from '../../../shared/card/card.component';
import { CardFieldComponent } from '../../../shared/card/card-field.component';
import { ActionButtonComponent } from '../../../shared/action-button/action-button.component';
import { SortablePageBase } from '../../../shared/table/sortable-page.base';
import { SearchBarComponent } from '../../../shared/search/search-bar.component';
import { FilterSelectComponent } from '../../../shared/search/filter-select.component';
import { FilterOption } from '../../../shared/search/filter-select.component';
@Component({ 
    selector: 'app-gestionar-recetas', 
    standalone: true,
    imports: [
        SectionHeaderComponent, ToolbarButtonComponent, 
        TableComponent, ThComponent, ThSortComponent, TdComponent, 
        CardComponent, CardFieldComponent, 
        ActionButtonComponent, SearchBarComponent, FilterSelectComponent,
        CommonModule, NgClass],
    template: `
        <app-section-header title="Gestionar Recetas" subtitle="Gestiona las recetas del obrador" icon="fas fa-clipboard-list">
            @if (auth.hasPermission()) {
                <app-toolbar-button toolbar text="Nueva Receta" icon="fa-solid fa-circle-plus" route="/obrador/recetas/nueva"/>
            }
        </app-section-header>

        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <app-search-bar class="sm:flex-1"
                (valueChange)="onBusqueda($event)"/>
            <app-filter-select
                placeholder="Tipo de producto"
                [options]="tipoOpciones"
                (valueChange)="onFiltro($event)"/>
            <app-filter-select
                placeholder="Ordenar por..."
                [options]="ordenOpciones"
                (valueChange)="onOrdenSelect($event)"/>
        </div>

        <div class="hidden lg:block">
            <app-table>
                <thead>
                    <tr>
                        <app-th-sort campo="tipo"
                            [campoActivo]="orden.campo" 
                            [dir]="orden.dir" 
                            (sortChange)="toggleOrden($event)"
                        >
                            Tipo
                        </app-th-sort>
                        <app-th>Nombre</app-th>
                        <app-th>Descripción</app-th>
                        <app-th>Ingredientes</app-th>
                        <app-th-sort campo="costeElaboracion" 
                            [campoActivo]="orden.campo" 
                            [dir]="orden.dir" 
                            (sortChange)="toggleOrden($event)"
                        >
                            Coste Elaboración (€)
                        </app-th-sort>
                        <app-th>Acciones</app-th>
                    </tr>
                </thead>
                <tbody>
                    @for (r of recetasPagina(); track r.id) {
                        <tr class="hover:bg-slate-50/80 transition-colors" (dblclick)="router.navigate(['/obrador/recetas/detalles', r.id])">
                            <app-td>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full border uppercase"
                                    [ngClass]="tipoClasses(r)">
                                    {{ tipoLabel(r) }}
                                </span>
                            </app-td>

                            <app-td>
                                <span class="text-sm font-medium text-slate-800">{{ r.nombre }}</span>
                            </app-td>

                             <app-td>
                                <div class="max-w-[260px]">
                                    <p class="text-sm text-slate-400 truncate">{{ r.descripcion }}</p>
                                </div>
                            </app-td>

                            <app-td>
                                <button type="button"
                                    (click)="verDetalle(r)"
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                                           bg-[var(--primary-50)] text-[var(--primary-600)]
                                           hover:bg-[var(--primary-100)] transition-colors">
                                    <i class="fa-solid fa-eye"></i>
                                    {{ r.ingredientes.length }} ingrediente{{ r.ingredientes.length !== 1 ? 's' : '' }}
                                </button>
                            </app-td>

                            <app-td>
                                <span class="text-sm text-slate-400 truncate max-w-xs">{{ r.costeElaboracion?.toFixed(2) }}€</span>
                            </app-td>

                            <app-td>
                                <div class="relative flex items-center gap-1"
                                     [class.opacity-40]="!auth.hasPermission()">
                                    <app-action-button
                                        iconClass="fa-solid fa-pen-to-square text-sm"
                                        hoverTextColor="hover:text-[var(--primary-600)]"
                                        (click)="router.navigate(['/obrador/recetas/detalles', r.id])"/>
                                    <app-action-button
                                        iconClass="fa-solid fa-trash text-sm"
                                        hoverTextColor="hover:text-red-600"
                                        (click)="eliminarReceta(r.id)"/>
                                    @if (!auth.hasPermission()) {
                                      <div class="absolute inset-0 cursor-not-allowed" (click)="tryWrite()"></div>
                                    }
                                </div>
                            </app-td>
                        </tr>
                    }
                </tbody>
            </app-table>
        </div>

        <div class="lg:hidden flex flex-col gap-4 mt-5">
            @for (r of recetasPagina(); track r.id) {
                <app-card>
                    <div card-header class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-9 h-9 rounded-full bg-white/20 text-white
                                        flex items-center justify-center text-sm flex-shrink-0">
                                @if (r.tipoReceta === 'CASERA') {
                                    <i class="fa-solid fa-mortar-pestle"></i>
                                } @else if (r.tipoHelado === 'BARQUETA') {
                                    <img src="/imgs/iconoHelado.png" class="w-6 h-6 brightness-0 invert" alt="Barqueta">
                                } @else {
                                    <img src="/imgs/iconoPaleta.png" class="w-6 h-6 brightness-0 invert" alt="Paleta">
                                }
                            </div>
                            <div class="min-w-0">
                                <p class="font-bold text-white text-sm leading-tight truncate">{{ r.nombre }}</p>
                                <span class="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold
                                             rounded-full bg-white/20 text-white/90 uppercase">
                                    {{ tipoLabel(r) }}
                                </span>
                            </div>
                        </div>
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0
                                     bg-white/20 text-white text-xs font-bold border border-white/30">
                            <i class="fa-solid fa-coins text-[10px]"></i>
                            {{ r.costeElaboracion?.toFixed(2) }}€
                        </span>
                    </div>

                    <p class="text-xs text-slate-400 leading-relaxed py-2.5 line-clamp-2">{{ r.descripcion }}</p>
                    @if (r.tipoReceta === 'CASERA') {
                        <app-card-field label="Cantidad estimada">
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                         bg-[var(--primary-50)] border border-[var(--primary-200)]
                                         text-[var(--primary-700)] text-xs font-bold">
                                <i class="fa-solid fa-scale-balanced text-[var(--primary-400)] text-[9px]"></i>
                                {{ rendimientoBase(r).toFixed(2) }} kg/L
                            </span>
                        </app-card-field>
                    }
                    <app-card-field label="Ingredientes">
                        <button type="button"
                            (click)="verDetalle(r)"
                            class="inline-flex items-center gap-1 text-xs font-semibold
                                   text-[var(--primary-600)] hover:text-[var(--primary-700)] transition-colors">
                            <i class="fa-solid fa-eye text-[10px]"></i>
                            {{ r.ingredientes.length }} ingrediente{{ r.ingredientes.length !== 1 ? 's' : '' }}
                        </button>
                    </app-card-field>

                    <div card-actions class="flex gap-2 w-full">
                        <button type="button"
                            (click)="router.navigate(['/obrador/recetas/detalles', r.id])"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                                   bg-white/10 hover:bg-white/20 border border-white/20
                                   text-white text-xs font-semibold transition-colors">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                            Editar
                        </button>
                        <button type="button"
                            (click)="eliminarReceta(r.id)"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                                   bg-white/10 hover:bg-red-500/40 border border-white/20
                                   text-white hover:text-red-200 text-xs font-semibold transition-colors">
                            <i class="fa-solid fa-trash text-xs"></i>
                            Eliminar
                        </button>
                    </div>
                </app-card>
            }
        </div>

        @if (recetaDetalle()) {
            <div class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
                 (click)="cerrarDetalle()">
                <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[80vh]"
                     (click)="$event.stopPropagation()">

                    <div class="relative rounded-t-2xl bg-[var(--primary-600)] p-6">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                                    <i class="fa-solid fa-list-check text-white text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-white tracking-tight leading-tight">
                                        {{ recetaDetalle()!.nombre }}
                                    </h3>
                                    <span class="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold rounded-full uppercase
                                                 bg-white/20 text-white/90 backdrop-blur-sm">
                                        {{ tipoLabel(recetaDetalle()!) }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold
                                             bg-white/20 text-white backdrop-blur-sm border border-white/30">
                                    <i class="fa-solid fa-coins text-xs"></i>
                                    {{ recetaDetalle()!.costeElaboracion?.toFixed(2) }}€
                                </span>
                                <button (click)="cerrarDetalle()"
                                        class="w-8 h-8 flex items-center justify-center rounded-xl
                                               bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-colors">
                                    <i class="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                        <div>
                            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-500)] mb-1">Descripción</p>
                            <p class="text-sm text-slate-600">{{ recetaDetalle()!.descripcion }}</p>
                        </div>
                    </div>

                    @if (recetaDetalle()!.tipoReceta === 'CASERA') {
                    <div class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                        <div>
                            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-500)] mb-1">Cantidad Estimada</p>
                        </div>
                            <div class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                        bg-[var(--primary-50)] border border-[var(--primary-200)]">
                                <i class="fa-solid fa-scale-balanced text-[var(--primary-500)] text-xs"></i>
                                <span class="text-xs font-bold text-[var(--primary-700)]">
                                    ~{{ rendimientoBase(recetaDetalle()!).toFixed(2) }} kg/L
                                </span>
                            </div>
                    </div>
                    }

                    <div class="px-6 py-4 overflow-y-auto flex flex-col gap-2">
                        <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-500)] mb-1">
                            Ingredientes ({{ recetaDetalle()!.ingredientes.length }})
                        </p>
                        @for (ing of recetaDetalle()!.ingredientes; track ing.id) {
                            <div class="flex items-center justify-between py-2 px-3
                                        rounded-xl border border-gray-100 bg-gray-50
                                        hover:bg-[var(--primary-50)] hover:border-[var(--primary-200)]
                                        cursor-pointer transition-colors"
                                 (click)="ing.subrecetaId
                                    ? router.navigate(['/obrador/recetas/detalles', ing.subrecetaId])
                                    : router.navigate(['/almacen/detalles', ing.producto?.id])">
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid {{ ing.subrecetaId ? 'fa-layer-group' : 'fa-flask' }}
                                              text-[var(--primary-400)] text-xs"></i>
                                    <span class="text-sm font-medium text-slate-700">
                                        @if (ing.subrecetaId) {
                                            {{ ing.subrecetaNombre }}
                                        } @else {
                                            {{ ing.producto?.nombre }}
                                        }
                                        <span class="text-slate-400 text-xs">({{ formatCoste(costeIngrediente(ing)) }}€)</span>
                                    </span>
                                </div>
                                <span class="text-xs font-bold text-[var(--primary-600)]">
                                    {{ ing.cantidadOriginal ?? ing.cantidad }} {{ ing.unidadOriginal ?? ing.producto?.unidadMedida }}
                                </span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        }
    ` })

export class GestionarRecetasComponent extends SortablePageBase<Receta> implements OnInit {
    private recetaService = inject(RecetaService);
    private route = inject(ActivatedRoute)
    private destroyRef = inject(DestroyRef);
    readonly pageSize = 10;

    filtro = '';

    readonly tipoOpciones: FilterOption[] = [
            { value: 'BARQUETA', label: 'Barqueta' },
            { value: 'PALETA',  label: 'Paleta'  },
            { value: 'CASERA',  label: 'Casera'  },
    ];
    
    readonly ordenOpciones: FilterOption[] = [
        { value: 'nombre_asc',  label: 'Nombre A → Z' },
        { value: 'nombre_desc', label: 'Nombre Z → A' },
        { value: 'tipo_asc',              label: 'Tipo A → Z'  },
        { value: 'tipo_desc',             label: 'Tipo Z → A'  },
        { value: 'costeElaboracion_asc',  label: 'Menor coste' },
        { value: 'costeElaboracion_desc', label: 'Mayor coste' },
    ];

    onFiltro(valor: string) { this.filtro = valor; this.cargarPagina(1); }

    recetasPagina  = signal<Receta[]>([]);
    paginaActual   = signal(1);
    totalPaginas   = signal(1);
    totalElementos = signal(0);
    recetaDetalle  = signal<Receta | null>(null);

    verDetalle(r: Receta)  { this.recetaDetalle.set(r); }
    cerrarDetalle()        { this.recetaDetalle.set(null); }

    tipoLabel(r: Receta): string {
        if (r.tipoReceta === 'CASERA') return 'Casera';
        return r.tipoHelado ?? '—';
    }

    tipoClasses(r: Receta): Record<string, boolean> {
        return {
            'bg-violet-100 text-violet-700 border-violet-200': r.tipoReceta === 'CASERA',
            'bg-sky-100    text-sky-700    border-sky-200':    r.tipoHelado === 'BARQUETA',
            'bg-pink-100   text-pink-700   border-pink-200':   r.tipoHelado === 'PALETA',
        };
    }

    get paginasVisibles(): (number | '...')[] {
        const total = this.totalPaginas();
        const actual = this.paginaActual();
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        const paginas: (number | '...')[] = [1];
        if (actual > 3) paginas.push('...');
        for (let i = Math.max(2, actual - 1); i <= Math.min(total - 1, actual + 1); i++) {
            paginas.push(i);
        }
        if (actual < total - 2) paginas.push('...');
        paginas.push(total);
        return paginas;
    }

    ngOnInit() {
        this.route.queryParamMap.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(params => {
            const pagina = +(params.get('pagina') ?? '1');
            this.cargarPagina(pagina);
        });
    }

    cargarPagina(pagina: number) {
        this.recetaService.getAllPaged(
            pagina - 1,
            this.pageSize,
            this.orden.campo || 'nombre',
            this.orden.dir,
            this.busqueda,
            this.filtro
        ).subscribe((res: RecetaPageResponse) => {
            this.recetasPagina.set(res.recetas);
            this.paginaActual.set(pagina);
            this.totalPaginas.set(res.totalPages);
            this.totalElementos.set(res.total);
        });
    }

    cambiarPagina(pagina: number) {
        this.router.navigate([], {
            queryParams: { pagina },
            queryParamsHandling: 'merge'
        });
    }

    min(a: number, b: number) {
        return Math.min(a, b);
    }

    async eliminarReceta(id: number) {
        const ok = await this.confirm.abrir({ mensaje: '¿Eliminar esta Receta?' });
        if (!ok) return;
        {
            this.recetaService.delete(id).subscribe({
                next: () => {
                    this.notif.info('Receta eliminada correctamente', 'Info');
                    const pagina = this.recetasPagina().length === 1 && this.paginaActual() > 1
                        ? this.paginaActual() - 1
                        : this.paginaActual();
                    this.cargarPagina(pagina);
                },
                error: (err) => this.notif.error(
                    err.error?.message || 'Error al eliminar la receta', 'Error'
                )
            });
        }
    }

    // Estima el rendimiento sumando las cantidades de ingredientes directos (no subrecetas),
    // que corresponden aproximadamente al peso/volumen final en kg o L.
    rendimientoBase(r: Receta): number {
        const total = r.ingredientes
            .filter(ing => ing.producto)
            .reduce((sum, ing) => sum + ing.cantidad, 0);
        return Math.round(total * 100) / 100;
    }

    // Para subrecetas usa el coste precalculado por el backend.
    // Para productos directos, normaliza el precio al contenido del envase (€/unidad de medida)
    // y luego multiplica por la cantidad usada en la receta.
    costeIngrediente(ing: IngredienteReceta): number {
        if (ing.subrecetaId) {
            return ing.cantidad * (ing.subrecetaCoste ?? 0);
        }
        if (!ing.producto) return 0;
        const precio = ing.producto.precio ?? 0;
        const contenido = ing.producto.contenidoPorUnidad ?? 0;
        const precioPorUnidad = contenido > 0 ? precio / contenido : precio;
        return ing.cantidad * precioPorUnidad;
    }

    // Ajusta los decimales según la magnitud para no mostrar "0.00" en costes
    // muy pequeños (p. ej. unos gramos de un ingrediente valorado por kilo).
    formatCoste(value: number): string {
        if (value === 0) return '0.00';
        if (value < 0.005) return value.toFixed(4);
        if (value < 0.05) return value.toFixed(3);
        return value.toFixed(2);
    }
}

