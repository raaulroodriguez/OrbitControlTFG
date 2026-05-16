import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgClass, DecimalPipe } from '@angular/common';
import { TableComponent } from '../../shared/table/table.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ToolbarButtonComponent } from '../../shared/section-header/toolbar-button.component';
import { ThComponent } from '../../shared/table/table-th.component';
import { ThSortComponent } from '../../shared/table/table-th-sort.component';
import { TdComponent } from '../../shared/table/table-td.component';
import { IngredienteReceta, Producto, TipoProducto, UNIDADES_MEDIDA } from '../../core/models/producto.model';
import { ProductoService, PageResponse } from '../../core/services/producto.service';
import { CardComponent } from '../../shared/card/card.component';
import { CardFieldComponent } from '../../shared/card/card-field.component';
import { ActionButtonComponent } from '../../shared/action-button/action-button.component';
import { SortablePageBase } from '../../shared/table/sortable-page.base';
import { SearchBarComponent } from '../../shared/search/search-bar.component';
import { FilterSelectComponent, FilterOption } from '../../shared/search/filter-select.component';

@Component({ 
    selector: 'app-gestionar-almacen', 
    standalone: true,
    imports: [
        SectionHeaderComponent, ToolbarButtonComponent, 
        TableComponent, ThComponent, ThSortComponent, TdComponent, 
        CardComponent, CardFieldComponent, 
        ActionButtonComponent, SearchBarComponent, FilterSelectComponent,
        NgClass, DecimalPipe],
    template: `
        <app-section-header title="Gestionar Almacén" subtitle="Administra los productos del almacén" icon="fas fa-boxes-stacked">
            @if (auth.hasPermission()) {
                <app-toolbar-button toolbar text="Nuevo producto" icon="fa-solid fa-circle-plus" route="/almacen/nuevo"/>
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
                    <app-th-sort campo="tipoProducto" 
                        [campoActivo]="orden.campo" 
                        [dir]="orden.dir" 
                        (sortChange)="toggleOrden($event)"
                    >
                        Tipo de Producto
                    </app-th-sort>
                    <app-th>Nombre</app-th>
                    <app-th-sort campo="proveedor.nombre" 
                        [campoActivo]="orden.campo" 
                        [dir]="orden.dir" 
                        (sortChange)="toggleOrden($event)"
                    >
                        Proveedor
                    </app-th-sort>
                    <app-th-sort campo="precio" 
                        [campoActivo]="orden.campo" 
                        [dir]="orden.dir" 
                        (sortChange)="toggleOrden($event)"
                    >
                        Precio(€)/Ud
                    </app-th-sort>
                    <app-th>Stock Actual</app-th>
                    <app-th>Stock Mínimo</app-th>
                    <app-th>Cantidad por Envase</app-th>
                    <app-th>Acciones</app-th>
                </tr>
            </thead>
            <tbody>
                @for (p of productosPagina(); track p.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors" (dblclick)="router.navigate(['/almacen/detalles', p.id])">
                    

                        <app-td center>
                            <span class="px-2 py-0.5 text-xs font-medium rounded-full border"
                                [ngClass]="tipoProductoClasses(p.tipoProducto)">
                                {{ p.tipoProducto }}
                            </span>
                        </app-td>

                        <app-td>
                            <div class="flex items-center gap-3">
                                <p class="font-medium text-slate-800 text-sm">{{ p.nombre }}</p>
                            </div>
                        </app-td>

                        <app-td>
                            <span class="text-slate-500 text-sm">{{ p.proveedor?.nombre || 'Desconocido' }}</span>
                        </app-td>

                        <app-td center>
                            <span class="text-slate-600 text-sm truncate block">{{ p.precio | number:'1.0-2' }}€</span>
                        </app-td>

                        <app-td center>
                            @if (p.stockActual <= p.stockMinimo) {
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                             bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                                    <i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
                                    {{ p.stockActual | number:'1.2-2' }}{{ um[p.unidadMedida].abreviatura }}
                                    {{ envaseLabel(p) }}
                                </span>
                            } @else {
                                {{ p.stockActual | number:'1.2-2' }}{{ um[p.unidadMedida].abreviatura }}
                                <span class="text-slate-400 text-xs">{{ envaseLabel(p) }}</span>
                            }
                        </app-td>
                        
                        <app-td center>
                            <span class="text-slate-600 text-sm">{{ p.stockMinimo | number:'1.2-2' }}{{ um[p.unidadMedida].abreviatura }}</span>
                        </app-td>

                        <app-td center>
                            <span class="text-slate-600 text-sm">{{ p.contenidoPorUnidad }}{{ um[p.unidadMedida].abreviatura }}</span>
                        </app-td>

                        <app-td>
                            <div class="relative flex items-center gap-1"
                                 [class.opacity-40]="!auth.hasPermission()">
                                <app-action-button
                                    iconClass="fa-solid fa-pen-to-square text-sm"
                                    hoverTextColor="hover:text-[var(--primary-600)]"
                                    (click)="router.navigate(['/almacen/detalles', p.id])"/>
                                <app-action-button
                                    iconClass="fa-solid fa-trash text-sm"
                                    hoverTextColor="hover:text-red-600"
                                    (click)="eliminarProducto(p.id)"/>
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
        @for (p of productosPagina(); track p.id) {
            <app-card>
                <div card-header class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-white/20 text-white
                        flex items-center justify-center text-sm font-bold flex-shrink-0">
                        @if (p.tipoProducto === 'OBRADOR') {
                            <i class="fa-solid fa-utensils"></i>
                        } @else if (p.tipoProducto === 'TIENDA') {
                            <i class="fa-solid fa-shop"></i>
                        } @else {
                            <i class="fa-solid fa-boxes-stacked"></i>
                        }
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm leading-tight">{{ p.nombre }}</p>
                        <p class="text-[11px] text-white/70">{{ p.proveedor?.nombre || 'Sin proveedor' }}</p>
                    </div>
                </div>

            <app-card-field label="Precio(€)/Ud">{{ p.precio }}€</app-card-field>
            <app-card-field label="Stock Actual">
                @if (p.stockActual <= p.stockMinimo) {
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                        <i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
                        {{ p.stockActual | number:'1.2-2' }}{{ um[p.unidadMedida].abreviatura }}
                        {{ envaseLabel(p) }}
                    </span>
                } @else {
                    {{ p.stockActual | number:'1.2-2' }}{{ um[p.unidadMedida].abreviatura }}
                    <span class="text-slate-400 text-xs">{{ envaseLabel(p) }}</span>
                }
            </app-card-field>
            <app-card-field label="Stock Mínimo">{{ p.stockMinimo | number:'1.2-2' }}{{ um[p.unidadMedida].abreviatura }}</app-card-field>
            <app-card-field label="Cantidad por Envase">{{ p.contenidoPorUnidad }}{{ um[p.unidadMedida].abreviatura }}</app-card-field>
            <app-card-field label="Tipo de Producto">
                <span class="px-2 py-0.5 text-xs font-medium rounded-full border"
                    [ngClass]="tipoProductoClasses(p.tipoProducto)">
                    {{ p.tipoProducto }}
                </span>
            </app-card-field>

            <div card-actions class="relative flex gap-2 w-full"
                 [class.opacity-40]="!auth.hasPermission()">
                <button type="button"
                    (click)="router.navigate(['/almacen/detalles', p.id])"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                           bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold transition-colors">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                    Editar
                </button>
                <button type="button"
                    (click)="eliminarProducto(p.id)"
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
export class GestionarAlmacenComponent extends SortablePageBase<Producto> implements OnInit {
    private productoService = inject(ProductoService);
    private route = inject(ActivatedRoute);
    readonly um = UNIDADES_MEDIDA;
    readonly pageSize = 10;

    filtro = '';

    readonly tipoOpciones: FilterOption[] = [
        { value: 'OBRADOR', label: 'Obrador' },
        { value: 'TIENDA',  label: 'Tienda'  },
        { value: 'AMBOS',   label: 'Ambos'   },
    ];

    readonly ordenOpciones: FilterOption[] = [
        { value: 'nombre_asc',        label: 'Nombre A → Z'     },
        { value: 'nombre_desc',       label: 'Nombre Z → A'     },
        { value: 'tipoProducto_asc',  label: 'Tipo A → Z'       },
        { value: 'tipoProducto_desc', label: 'Tipo Z → A'       },
        { value: 'precio_asc',        label: 'Menor precio'     },
        { value: 'precio_desc',       label: 'Mayor precio'     },
        { value: 'stockActual_asc',   label: 'Menor stock'      },
        { value: 'stockActual_desc',  label: 'Mayor stock'      },
    ];

    onFiltro(valor: string) { this.filtro = valor; this.cargarPagina(1); }

    productosPagina = signal<Producto[]>([]);
    paginaActual = signal(1);
    totalPaginas = signal(1);
    totalElementos = signal(0);

    get paginasVisibles(): (number | '...')[] {
        const total = this.totalPaginas();
        const actual = this.paginaActual();
        if (total <= 7) {
            return Array.from(Array(total).keys()).map(i => i + 1)
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
        this.route.queryParamMap.subscribe(params => {
            const pagina = +(params.get('pagina') ?? '1');
            this.cargarPagina(pagina);
        });
    }

    cargarPagina(pagina: number) {
        this.productoService.getAllPaged(
            pagina - 1,
            this.pageSize,
            this.orden.campo || 'nombre',
            this.orden.dir,
            this.busqueda,
            this.filtro
        ).subscribe({
            next: (res: PageResponse<Producto>) => {
                this.productosPagina.set(res.productos);
                this.paginaActual.set(pagina);
                this.totalPaginas.set(res.totalPages);
                this.totalElementos.set(res.total);
            },
            error: () => this.notif.error('Error al cargar los productos', 'Error')
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

    envaseLabel(p: Producto): string {
        if (!p.contenidoPorUnidad || !p.envase) return '';
        const u = p.stockActual / p.contenidoPorUnidad;
        const entero = Number.isInteger(u);
        const num = entero ? u : Math.floor(u);
        return entero ? `(${num} ${p.envase})` : `(~${num} ${p.envase})`;
    }

    tipoProductoClasses(tipo: TipoProducto | undefined): Record<string, boolean> {
        return {
            'bg-blue-100 text-blue-700 border-blue-200':       tipo === 'OBRADOR',
            'bg-amber-100 text-amber-700 border-amber-200':    tipo === 'AMBOS',
            'bg-green-100 text-green-700 border-green-200':    tipo === 'TIENDA'
        };
    }

    async eliminarProducto(id: number) {
        const ok = await this.confirm.abrir({ mensaje: 'Â¿Eliminar este producto?' });
        if (!ok) return;
        {
            this.productoService.delete(id).subscribe({
                next: () => {
                    this.notif.info('Producto eliminado correctamente', 'Info');
                    const pagina = this.productosPagina().length === 1 && this.paginaActual() > 1
                        ? this.paginaActual() - 1
                        : this.paginaActual();
                    this.cargarPagina(pagina);
                },
                error: (err) => this.notif.error(
                    err.error?.message || 'Error al eliminar el producto', 'Error'
                )
            });
        }
    }

    costeIngrediente(ing: IngredienteReceta): number {
            if (ing.subrecetaId) {
                return Math.round(ing.cantidad * (ing.subrecetaCoste ?? 0) * 100) / 100;
            }
            if (!ing.producto) return 0;
            return Math.round(ing.cantidad * (ing.producto.precio ?? 0) * 100) / 100;
    }
}

