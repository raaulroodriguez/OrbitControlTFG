import { Component, OnInit, DestroyRef, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TableComponent } from '../../../shared/table/table.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { ToolbarButtonComponent } from '../../../shared/section-header/toolbar-button.component';
import { ThComponent } from '../../../shared/table/table-th.component';
import { ThSortComponent } from '../../../shared/table/table-th-sort.component';
import { TdComponent } from '../../../shared/table/table-td.component';
import { Helado } from '../../../core/models/helado.model';
import { HeladoService, HeladoPageResponse } from '../../../core/services/helado.service';
import { CardComponent } from '../../../shared/card/card.component';
import { CardFieldComponent } from '../../../shared/card/card-field.component';
import { ActionButtonComponent } from '../../../shared/action-button/action-button.component';
import { NgClass } from '@angular/common';
import { SortablePageBase } from '../../../shared/table/sortable-page.base';
import { SearchBarComponent } from '../../../shared/search/search-bar.component';
import { FilterSelectComponent } from '../../../shared/search/filter-select.component';
import { FilterOption } from '../../../shared/search/filter-select.component';

@Component({
    selector: 'app-consultar-stock',
    standalone: true,
    imports: [
        SectionHeaderComponent, ToolbarButtonComponent, 
        TableComponent, ThComponent, ThSortComponent, TdComponent, 
        CardComponent, CardFieldComponent, 
        ActionButtonComponent, SearchBarComponent, FilterSelectComponent,
        NgClass],
    template: `
        <app-section-header title="Consultar Stock" subtitle="Revisa el estado del inventario de helados" icon="fas fa-clipboard-list">
            @if (auth.hasPermission()) {
                <app-toolbar-button toolbar text="Nuevo Helado" icon="fa-solid fa-circle-plus" route="/obrador/nueva"/>
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
                    <app-th-sort campo="stockActual" 
                            [campoActivo]="orden.campo" 
                            [dir]="orden.dir" 
                            (sortChange)="toggleOrden($event)"
                        >
                            Stock Actual
                        </app-th-sort>
                    <app-th>Stock Mínimo</app-th>
                    <app-th-sort campo="costeProducion" 
                            [campoActivo]="orden.campo" 
                            [dir]="orden.dir" 
                            (sortChange)="toggleOrden($event)"
                        >
                            Coste Producción (€)
                        </app-th-sort>
                    <app-th>Acciones</app-th>
                </tr>
            </thead>
            <tbody>
                @for (h of heladosPagina(); track h.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors" (dblclick)="router.navigate(['/obrador/detalles', h.id])">

                        <app-td>
                                <span class="px-2 py-0.5 text-xs font-medium rounded-full border uppercase"
                                    [ngClass]="tipoClasses(h)">
                                    {{ h.tipo }}
                                </span>
                            </app-td>

                        <app-td>
                            <span class="text-slate-500 text-sm">{{ h.nombre }}</span>
                        </app-td>

                        <app-td>
                            @if (h.stockActual <= h.stockMinimo) {
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                             bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                                    <i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
                                    {{ h.stockActual }}
                                </span>
                            } @else {
                                {{ h.stockActual }}
                            }                        
                        </app-td>

                        <app-td>
                            <span class="text-slate-600 text-sm">{{ h.stockMinimo }}</span>
                        </app-td>

                        <app-td>
                            <span class="text-slate-600 text-sm">{{ h.costeProducion.toFixed(2) }}€</span>
                        </app-td>

                        <app-td>
                            <div class="relative flex items-center gap-1"
                                 [class.opacity-40]="!auth.hasPermission()">
                                <app-action-button
                                    iconClass="fa-solid fa-pen-to-square text-sm"
                                    hoverTextColor="hover:text-[var(--primary-600)]"
                                    (click)="router.navigate(['/obrador/detalles', h.id])"/>
                                <app-action-button
                                    iconClass="fa-solid fa-trash text-sm"
                                    hoverTextColor="hover:text-red-600"
                                    (click)="eliminarHelado(h.id)"/>
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
        @for (h of heladosPagina(); track h.id) {
            <app-card>
                <div card-header class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-white/20 text-white
                        flex items-center justify-center text-sm font-bold flex-shrink-0">
                        @if (h.tipo === 'BARQUETA') {
                            <img src="/imgs/iconoHelado.png" class="w-6 h-6 brightness-0 invert" alt="Barqueta">
                        } @else if (h.tipo === 'PALETA') {
                            <img src="/imgs/iconoPaleta.png" class="w-6 h-6 brightness-0 invert" alt="Paleta">
                        }
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm leading-tight">{{ h.nombre }}</p>
                        <p class="text-[10px] text-white/70">{{ h.tipo }}</p>
                    </div>
                </div>

            <app-card-field label="Stock Actual">
                @if (h.stockActual <= h.stockMinimo) {
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                        <i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
                        {{ h.stockActual }}
                    </span>
                } @else {
                    {{ h.stockActual }}
                }
            </app-card-field>
            <app-card-field label="Stock Mínimo">{{ h.stockMinimo }}</app-card-field>
            <app-card-field label="Coste de Producción">{{ h.costeProducion.toFixed(2) }}€</app-card-field>

            <div card-actions class="relative flex gap-2 w-full"
                 [class.opacity-40]="!auth.hasPermission()">
                <button type="button"
                    (click)="router.navigate(['/obrador/recetas/detalles', h.id])"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                           bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold transition-colors">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                    Editar
                </button>
                <button type="button"
                    (click)="eliminarHelado(h.id)"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                           bg-white/10 hover:bg-red-500/40 border border-white/20
                           text-white hover:text-red-200 text-xs font-semibold transition-colors">
                    <i class="fa-solid fa-trash text-xs"></i>
                    Eliminar
                </button>
                @if (!auth.hasPermission()) {
                  <div class="absolute inset-0 cursor-not-allowed" (click)="tryWrite()"></div>
                }
            </div>
            </app-card>
            }
        </div>

        @if (totalPaginas() > 1) {
        <div class="flex items-center justify-center gap-2 mt-6">
            <button
                class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600
                       hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                [disabled]="paginaActual() === 1"
                (click)="cambiarPagina(paginaActual() - 1)">
                <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>

            @for (item of paginasVisibles; track item) {
                @if (item === '...') {
                    <span class="px-2 text-slate-400 text-sm select-none">...</span>
                } @else {
                    <button
                        class="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                        [class]="+item === paginaActual()
                            ? 'bg-[var(--primary-600)] text-white border-[var(--primary-600)]'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                        (click)="cambiarPagina(+item)">
                        {{ item }}
                    </button>
                }
            }

            <button
                class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600
                       hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                [disabled]="paginaActual() === totalPaginas()"
                (click)="cambiarPagina(paginaActual() + 1)">
                <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
        </div>
        <p class="text-center text-xs text-slate-400 mt-2">
            {{ (paginaActual() - 1) * pageSize + 1 }} – {{ min(paginaActual() * pageSize, totalElementos()) }}
            de {{ totalElementos() }}
        </p>
        }
    `
})
export class ConsultarStockComponent extends SortablePageBase<Helado> implements OnInit {
    private heladoService  = inject(HeladoService);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);
    readonly pageSize = 10;

    filtro = '';

    readonly tipoOpciones: FilterOption[] = [
            { value: 'BARQUETA', label: 'Barqueta' },
            { value: 'PALETA',  label: 'Paleta'  },
    ];
    
    readonly ordenOpciones: FilterOption[] = [
        { value: 'nombre_asc',  label: 'Nombre A → Z' },
        { value: 'nombre_desc', label: 'Nombre Z → A' },
        { value: 'tipo_asc',           label: 'Tipo A → Z'         },
        { value: 'tipo_desc',          label: 'Tipo Z → A'         },
        { value: 'stockActual_asc',    label: 'Menor stock'        },
        { value: 'stockActual_desc',   label: 'Mayor stock'        },
        { value: 'costeProducion_asc', label: 'Menor coste'        },
        { value: 'costeProducion_desc',label: 'Mayor coste'        },
    ];

    onFiltro(valor: string) { this.filtro = valor; this.cargarPagina(1); }

    heladosPagina = signal<Helado[]>([]);
    paginaActual = signal(1);
    totalPaginas = signal(1);
    totalElementos = signal(0);
    
    tipoClasses(h: Helado): Record<string, boolean> {
        return {
            'bg-green-100 text-green-700 border-green-200':    h.tipo === 'BARQUETA',
            'bg-amber-100 text-amber-700 border-amber-200':   h.tipo === 'PALETA',
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
        this.heladoService.getAllPaged(
            pagina - 1,
            this.pageSize,
            this.orden.campo || 'nombre',
            this.orden.dir,
            this.busqueda,
            this.filtro
        ).subscribe((res: HeladoPageResponse) => {
            this.heladosPagina.set(res.helados);
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

    async eliminarHelado(id: number) {
        const ok = await this.confirm.abrir({ mensaje: 'Â¿Eliminar este helado?' });
        if (!ok) return;
        {
            this.heladoService.delete(id).subscribe({
                next: () => {
                    this.notif.info('Helado eliminado correctamente', 'Info');
                    const pagina = this.heladosPagina().length === 1 && this.paginaActual() > 1
                        ? this.paginaActual() - 1
                        : this.paginaActual();
                    this.cargarPagina(pagina);
                },
                error: (err) => this.notif.error(
                    err.error?.message || 'Error al eliminar helado', 'Error'
                )
            });
        }
    }
}

