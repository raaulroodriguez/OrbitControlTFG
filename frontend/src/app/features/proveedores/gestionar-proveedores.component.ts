import { Component, OnInit, DestroyRef, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { TableComponent } from '../../shared/table/table.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ToolbarButtonComponent } from '../../shared/section-header/toolbar-button.component';
import { ThComponent } from '../../shared/table/table-th.component';
import { ThSortComponent } from '../../shared/table/table-th-sort.component';
import { TdComponent } from '../../shared/table/table-td.component';
import { Proveedor, TipoProducto } from '../../core/models/proveedor.model';
import { ProveedorService, ProveedorPageResponse } from '../../core/services/proveedor.service';
import { CardComponent } from '../../shared/card/card.component';
import { CardFieldComponent } from '../../shared/card/card-field.component';
import { ActionButtonComponent } from '../../shared/action-button/action-button.component';
import { SortablePageBase } from '../../shared/table/sortable-page.base';
import { SearchBarComponent } from '../../shared/search/search-bar.component';
import { FilterSelectComponent, FilterOption } from '../../shared/search/filter-select.component';

@Component({
    selector: 'app-gestionar-proveedores',
    standalone: true,
    imports: [TableComponent, SectionHeaderComponent, ToolbarButtonComponent, ThComponent, ThSortComponent, TdComponent, CardComponent, CardFieldComponent, ActionButtonComponent, NgClass, SearchBarComponent, FilterSelectComponent],
    template: `
        <app-section-header title="Gestionar Proveedores" subtitle="Administra los proveedores de la aplicación" icon="fas fa-people-carry-box">
            @if (auth.hasPermission()) {
                <app-toolbar-button toolbar text="Nuevo proveedor" icon="fa-solid fa-circle-plus" route="/proveedores/nuevo"/>
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
                    <app-th>NIF</app-th>
                    <app-th>Email</app-th>
                    <app-th>Teléfono</app-th>
                    <app-th>Dirección</app-th>
                    <app-th>Acciones</app-th>
                </tr>
            </thead>
            <tbody>
                @for (p of proveedoresPagina(); track p.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors" (dblclick)="router.navigate(['/proveedores/detalles', p.id])">

                        <app-td>
                            <span class="px-2 py-0.5 text-xs font-medium rounded-full border"
                            [ngClass]="tipoProductoClasses(p.tipoProducto)">
                            {{ p.tipoProducto }}</span>
                        </app-td>

                        <app-td>
                            <div class="flex items-center gap-3">
                                <p class="font-medium text-slate-800 text-sm">{{ p.nombre }}</p>
                            </div>
                        </app-td>

                        <app-td>
                            <span class="text-slate-500 text-sm">{{ p.nif }}</span>
                        </app-td>

                        <app-td>
                            <span class="text-slate-600 text-sm truncate block">{{ p.email }}</span>
                        </app-td>

                        <app-td>
                            <span class="text-slate-600 text-sm">{{ p.telefono }}</span>
                        </app-td>

                        <app-td>
                            <span class="text-slate-600 text-sm">{{ p.direccion }}</span>
                        </app-td>

                        <app-td>
                            <div class="relative flex items-center gap-1"
                                 [class.opacity-40]="!auth.hasPermission()">
                                <app-action-button
                                    iconClass="fa-solid fa-pen-to-square text-sm"
                                    hoverTextColor="hover:text-[var(--primary-600)]"
                                    (click)="router.navigate(['/proveedores/detalles', p.id])"/>
                                <app-action-button
                                    iconClass="fa-solid fa-trash text-sm"
                                    hoverTextColor="hover:text-red-600"
                                    (click)="eliminarProveedor(p.id)"/>
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
        @for (p of proveedoresPagina(); track p.id) {
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
                        <p class="text-[10px] text-white/70">{{ p.nif }}</p>
                    </div>
                </div>

            <app-card-field label="Email">{{ p.email }}</app-card-field>
            <app-card-field label="Teléfono">{{ p.telefono }}</app-card-field>
            <app-card-field label="Dirección">{{ p.direccion }}</app-card-field>
            <app-card-field label="Tipo de Producto">
                <span class="px-2 py-0.5 text-xs font-medium rounded-full border"
                    [ngClass]="tipoProductoClasses(p.tipoProducto)">
                    {{ p.tipoProducto }}
                </span>
            </app-card-field>

            <div card-actions class="relative flex gap-2 w-full"
                 [class.opacity-40]="!auth.hasPermission()">
                <button type="button"
                    (click)="router.navigate(['/proveedores/detalles', p.id])"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                           bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold transition-colors">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                    Editar
                </button>
                <button type="button"
                    (click)="eliminarProveedor(p.id)"
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
export class GestionarProveedoresComponent extends SortablePageBase<Proveedor> implements OnInit {
    private proveedorService = inject(ProveedorService);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);
    readonly pageSize = 10;

    filtro = '';

    readonly tipoOpciones: FilterOption[] = [
        { value: 'OBRADOR', label: 'Obrador' },
        { value: 'TIENDA',  label: 'Tienda'  },
        { value: 'AMBOS',   label: 'Ambos'   },
    ];

    readonly ordenOpciones: FilterOption[] = [
        { value: 'nombre_asc',       label: 'Nombre A → Z'   },
        { value: 'nombre_desc',      label: 'Nombre Z → A'   },
        { value: 'tipoProducto_asc', label: 'Tipo A → Z'     },
        { value: 'tipoProducto_desc',label: 'Tipo Z → A'     },
    ];

    onFiltro(valor: string) { this.filtro = valor; this.cargarPagina(1); }

    proveedoresPagina = signal<Proveedor[]>([]);
    paginaActual = signal(1);
    totalPaginas = signal(1);
    totalElementos = signal(0);

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
        this.proveedorService.getAllPaged(
            pagina - 1,
            this.pageSize,
            this.orden.campo || 'nombre',
            this.orden.dir,
            this.busqueda,
            this.filtro
        ).subscribe((res: ProveedorPageResponse) => {
            this.proveedoresPagina.set(res.proveedores);
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

    tipoProductoClasses(tipo: TipoProducto): Record<string, boolean> {
        return {
            'bg-blue-100 text-blue-700 border-blue-200':       tipo === 'OBRADOR',
            'bg-amber-100 text-amber-700 border-amber-200':    tipo === 'AMBOS',
            'bg-green-100 text-green-700 border-green-200':    tipo === 'TIENDA'
        };
    }

    async eliminarProveedor(id: number) {
        const ok = await this.confirm.abrir({ mensaje: 'Â¿Eliminar este proveedor?' });
        if (!ok) return;
        {
            this.proveedorService.delete(id).subscribe({
                next: () => {
                    this.notif.info('Proveedor eliminado correctamente', 'Info');
                    const pagina = this.proveedoresPagina().length === 1 && this.paginaActual() > 1
                        ? this.paginaActual() - 1
                        : this.paginaActual();
                    this.cargarPagina(pagina);
                },
                error: (err) => this.notif.error(
                    err.error?.message || 'Error al eliminar el proveedor', 'Error'
                )
            });
        }
    }

}

