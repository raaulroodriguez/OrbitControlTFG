import { Component, OnInit, OnDestroy, DestroyRef, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NgClass } from '@angular/common';
import { TableComponent } from '../../shared/table/table.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ToolbarButtonComponent } from '../../shared/section-header/toolbar-button.component';
import { ThComponent } from '../../shared/table/table-th.component';
import { ThSortComponent } from '../../shared/table/table-th-sort.component';
import { TdComponent } from '../../shared/table/table-td.component';
import { Usuario, RolNombre } from '../../core/models/usuario.model';
import { UsuarioService, UsuarioPageResponse } from '../../core/services/usuario.service';
import { CardComponent } from '../../shared/card/card.component';
import { CardFieldComponent } from '../../shared/card/card-field.component';
import { ActionButtonComponent } from '../../shared/action-button/action-button.component';
import { SortablePageBase } from '../../shared/table/sortable-page.base';
import { SearchBarComponent } from '../../shared/search/search-bar.component';
import { FilterSelectComponent } from '../../shared/search/filter-select.component';


@Component({
    selector: 'app-gestionar-usuarios',
    standalone: true,
    imports: [TableComponent, SectionHeaderComponent, ToolbarButtonComponent, ThComponent, ThSortComponent, TdComponent, CardComponent, CardFieldComponent, NgClass, ActionButtonComponent, SearchBarComponent, FilterSelectComponent],
    template: `
    <app-section-header title="Gestionar Usuarios" subtitle="Administra los usuarios de la aplicación" icon="fas fa-users">
        <app-toolbar-button toolbar text="Nuevo usuario" icon="fa-solid fa-circle-plus" route="/usuarios/nuevo"/>
    </app-section-header>

    <div class="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
        <app-search-bar class="sm:flex-1" (valueChange)="onBusqueda($event)"/>
        <app-filter-select
            placeholder="Todos los roles"
            [options]="rolesOpciones"
            (valueChange)="onFiltro($event)"/>
        <div>
            <app-filter-select
                placeholder="Ordenar por"
                [options]="ordenOpciones"
                (valueChange)="onOrdenSelect($event)"/>
        </div>
    </div>

    <div class="hidden lg:block">
        <app-table>
            <thead>
                <tr>
                    <app-th-sort campo="roles" 
                        [campoActivo]="orden.campo" 
                        [dir]="orden.dir" 
                        (sortChange)="toggleOrden($event)"
                    >
                        Roles
                    </app-th-sort>
                    <app-th>
                            Nombre
                    </app-th>
                    <app-th>Usuario</app-th>
                    <app-th>Email</app-th>
                    <app-th>Teléfono</app-th>
                    <app-th>Método de Acceso</app-th>
                    <app-th>Acciones</app-th>
                </tr>
            </thead>
            <tbody>
                @for (u of usuariosPagina(); track u.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer" (dblclick)="router.navigate(['/usuarios/detalles', u.id])">

                        <app-td>
                            <div class="flex gap-2 items-start">
                                @for (r of u.roles; track r.id) {
                                    <span class="px-2 py-0.5 text-xs font-medium rounded-full border"
                                            [ngClass]="rolClasses(r.rol)"
                                            title="{{ r.rol }}">
                                        {{ r.rol[0] }}{{ r.rol[1] }}{{ r.rol[2] }}
                                    </span>
                                }
                            </div>
                        </app-td>

                        <app-td>
                            <span class="font-medium text-slate-800 text-sm">{{ u.nombre }} {{ u.apellidos }}</span>
                        </app-td>

                        <app-td>
                            <span class="text-slate-500 text-sm">{{ u.nombreUsuario }}</span>
                        </app-td>

                        <app-td>
                            <span class="text-slate-600 text-sm truncate block">{{ u.email }}</span>
                        </app-td>

                        <app-td>
                            <span class="text-slate-600 text-sm">{{ u.telefono }}</span>
                        </app-td>

                        <app-td>
                            <div class="flex justify-center">
                                @if (u.nfcUid) {
                                    <app-action-button
                                        iconClass="fa-solid fa-trash-can text-xs"
                                        bgColor="bg-red-100" textColor="text-red-600"
                                        hoverBgColor="hover:bg-red-100" hoverTextColor="hover:text-red-500"
                                        rounded="rounded-full" size="w-7 h-7"
                                        (click)="eliminarNFC(u.id)"/>
                                } @else {
                                    <app-action-button
                                        iconClass="fa-solid fa-plus text-xs"
                                        bgColor="bg-slate-100"
                                        hoverBgColor="hover:bg-slate-200" hoverTextColor="hover:text-slate-600"
                                        rounded="rounded-full" size="w-7 h-7"
                                        (click)="abrirModalNfc(u.id)"/>
                                }
                            </div>
                        </app-td>

                        <app-td>
                            <div class="flex items-center gap-1">
                                <app-action-button
                                    iconClass="fa-solid fa-pen-to-square text-sm"
                                    hoverTextColor="hover:text-[var(--primary-600)]"
                                    (click)="router.navigate(['/usuarios/detalles', u.id])"/>
                                <app-action-button
                                    iconClass="fa-solid fa-trash text-sm"
                                    hoverTextColor="hover:text-red-600"
                                    (click)="eliminarUsuario(u.id)"/>
                            </div>
                        </app-td>

                    </tr>
                }
            </tbody>

        </app-table>
        </div>

        <div class="lg:hidden flex flex-col gap-4 mt-2">
        @for (u of usuariosPagina(); track u.id) {
            <app-card>
                <div card-header class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {{ u.nombre[0] }}{{ u.apellidos[0] }}
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm leading-tight">{{ u.nombre }} {{ u.apellidos }}</p>
                        <p class="text-[10px] text-white/70">@{{ u.nombreUsuario }}</p>
                    </div>
                </div>

            <app-card-field label="Email">{{ u.email }}</app-card-field>
            <app-card-field label="Teléfono">{{ u.telefono }}</app-card-field>
            <app-card-field label="Roles">
                <div class="flex flex-wrap gap-1 justify-end">
                    @for (r of u.roles; track r.id) {
                        <span class="px-2 py-0.5 text-xs font-medium rounded-full border"
                              [ngClass]="rolClasses(r.rol)">
                            {{ r.rol[0] }}{{ r.rol[1] }}{{ r.rol[2] }}
                        </span>
                    }
                </div>
            </app-card-field>

            <app-card-field label="Método de Acceso">
                @if (u.nfcUid) {
                    <app-action-button
                        iconClass="fa-solid fa-trash-can text-xs"
                        bgColor="bg-red-100" textColor="text-red-600"
                        hoverBgColor="hover:bg-red-100" hoverTextColor="hover:text-red-500"
                        rounded="rounded-full" size="w-7 h-7"
                        (click)="eliminarNFC(u.id)"/>
                } @else {
                    <app-action-button
                        iconClass="fa-solid fa-plus text-xs"
                        bgColor="bg-slate-100"
                        hoverBgColor="hover:bg-slate-200" hoverTextColor="hover:text-slate-600"
                        rounded="rounded-full" size="w-7 h-7"
                        (click)="abrirModalNfc(u.id)"/>
                }
            </app-card-field>

            <div card-actions class="flex gap-2 w-full">
                <button type="button"
                    (click)="router.navigate(['/usuarios/detalles', u.id])"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                           bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold transition-colors">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                    Editar
                </button>
                <button type="button"
                    (click)="eliminarUsuario(u.id)"
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

        @if (modalNfcUsuarioId() !== null) {
            <div class="fixed inset-0 z-50 flex items-center justify-center">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="cerrarModalNfc()"></div>

                <div class="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-6">
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl bg-[var(--primary-600)] flex items-center justify-center text-white shadow-md">
                                <i class="fa-solid fa-id-card text-sm"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800 text-base leading-tight">Escanear NFC</h3>
                                <p class="text-xs text-slate-400">{{ nombreUsuarioModal() }}</p>
                            </div>
                        </div>
                        <app-action-button
                            iconClass="fa-solid fa-xmark"
                            hoverBgColor="hover:bg-slate-100" hoverTextColor="hover:text-slate-600"
                            rounded="rounded-full" size="w-8 h-8"
                            (click)="cerrarModalNfc()"/>
                    </div>

                    @if (errorNfc()) {
                        <div class="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            <i class="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                            <span>{{ errorNfc() }}</span>
                        </div>
                    }

                    @if (!escuchandoRfid) {
                        <div class="flex flex-col items-center gap-4 w-full">
                            <div class="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                                <i class="fa-solid fa-wifi text-4xl text-slate-300 rotate-90"></i>
                            </div>
                            <p class="text-sm text-slate-500 text-center">Pulsa el botón para activar el lector y acerca la tarjeta.</p>
                            <button (click)="onScanCard()"
                                class="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--primary-600)] hover:bg-[var(--primary-700)] transition-colors shadow-sm flex items-center justify-center gap-2">
                                <i class="fa-solid fa-satellite-dish"></i> Activar lector
                            </button>
                        </div>
                    } @else {
                        <div class="flex flex-col items-center gap-4 w-full">
                            <div class="relative flex items-center justify-center w-24 h-24">
                                <span class="absolute inline-flex h-full w-full rounded-full bg-[var(--primary-400)] opacity-30 animate-ping"></span>
                                <div class="w-20 h-20 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
                                    <i class="fa-solid fa-wifi text-4xl text-[var(--primary-600)] rotate-90"></i>
                                </div>
                            </div>
                            <p class="text-sm font-medium text-slate-700 text-center">Acerque la tarjeta al lector...</p>
                            <button (click)="cancelarScan()"
                                class="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                <i class="fa-solid fa-xmark"></i> Cancelar escaneo
                            </button>
                        </div>
                    }
                </div>
            </div>
        }
    `
})
export class GestionarUsuariosComponent extends SortablePageBase<Usuario> implements OnInit, OnDestroy {
    private usuariosService  = inject(UsuarioService);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);
    readonly pageSize = 10;

    filtro = '';

    readonly rolesOpciones = [
        { value: 'ADMIN',       label: 'Admin'       },
        { value: 'ENCARGADO',   label: 'Encargado'   },
        { value: 'HELADERO',    label: 'Heladero'    },
        { value: 'DEPENDIENTE', label: 'Dependiente' },
    ];

    readonly ordenOpciones = [
        { value: 'nombre_asc',  label: 'Nombre A → Z' },
        { value: 'nombre_desc', label: 'Nombre Z → A' },
        { value: 'roles_asc',   label: 'Rol A → Z'    },
        { value: 'roles_desc',  label: 'Rol Z → A'    },
    ];

    onFiltro(valor: string) {
        this.filtro = valor;
        this.cargarPagina(1);
    }

    usuariosPagina = signal<Usuario[]>([]);
    paginaActual = signal(1);
    totalPaginas = signal(1);
    totalElementos = signal(0);

    modalNfcUsuarioId = signal<number | null>(null);
    nombreUsuarioModal = signal<string>('');
    errorNfc = signal<string | null>(null);
    escuchandoRfid = false;
    private nfcBuffer = '';
    private nfcTimer: any = null;
    private nfcKeyHandler = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (this.nfcBuffer.length >= 6) {
                this.guardarNfc(this.nfcBuffer.trim());
            }
            this.nfcBuffer = '';
            return;
        }
        if (e.key.length === 1) {
            this.nfcBuffer += e.key;
        }
        if (this.nfcTimer) clearTimeout(this.nfcTimer);
        this.nfcTimer = setTimeout(() => { this.nfcBuffer = ''; }, 150);
    };

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

    ngOnInit(): void {
        this.route.queryParamMap.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(params => {
            const pagina = +(params.get('pagina') ?? '1');
            this.cargarPagina(pagina);
        });
    }

    

    cargarPagina(pagina: number) {
        this.usuariosService.getAllPaged(
            pagina - 1,
            this.pageSize,
            this.orden.campo || 'nombre',
            this.orden.dir,
            this.busqueda,
            this.filtro
        ).subscribe((res: UsuarioPageResponse) => {
            this.usuariosPagina.set(res.usuarios);
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

    rolClasses(rol: RolNombre): Record<string, boolean> {
        return {
            'bg-purple-100 text-purple-700 border-purple-200': rol === 'ADMIN',
            'bg-blue-100 text-blue-700 border-blue-200':       rol === 'ENCARGADO',
            'bg-amber-100 text-amber-700 border-amber-200':    rol === 'HELADERO',
            'bg-green-100 text-green-700 border-green-200':    rol === 'DEPENDIENTE',
            'bg-slate-100 text-slate-600 border-slate-200':    !['ADMIN', 'ENCARGADO', 'HELADERO', 'DEPENDIENTE'].includes(rol),
        };
    }

    ngOnDestroy(): void {
        this.cancelarScan();
    }

    abrirModalNfc(id: number): void {
        const u = this.usuariosPagina().find(u => u.id === id);
        this.nombreUsuarioModal.set(u ? `${u.nombre} ${u.apellidos}` : '');
        this.modalNfcUsuarioId.set(id);
        this.escuchandoRfid = false;
        this.nfcBuffer = '';
        this.errorNfc.set(null);
    }

    cerrarModalNfc(): void {
        this.cancelarScan();
        this.modalNfcUsuarioId.set(null);
        this.nombreUsuarioModal.set('');
        this.errorNfc.set(null);
    }

    onScanCard(): void {
        this.escuchandoRfid = true;
        this.nfcBuffer = '';
        document.addEventListener('keydown', this.nfcKeyHandler);
    }

    cancelarScan(): void {
        this.escuchandoRfid = false;
        this.nfcBuffer = '';
        if (this.nfcTimer) { clearTimeout(this.nfcTimer); this.nfcTimer = null; }
        document.removeEventListener('keydown', this.nfcKeyHandler);
    }

    private guardarNfc(uid: string): void {
        const id = this.modalNfcUsuarioId();
        if (id === null) return;

        this.cancelarScan();
        this.errorNfc.set(null);
        this.usuariosService.putNFC(id, uid).subscribe({
            next: updated => {
                this.usuariosPagina.update(list => list.map(u => u.id === id ? { ...u, nfcUid: updated.nfcUid } : u));
                this.cerrarModalNfc();
            },
            error: err => {
                const msg = err?.error?.message ?? 'Error al asignar la tarjeta NFC';
                this.errorNfc.set(msg);
            }
        });
    }

    async eliminarUsuario(id: number) {
        const ok = await this.confirm.abrir({ mensaje: '¿Eliminar este usuario?' });
        if (!ok) return;
        this.usuariosService.delete(id).subscribe({
            next: () => {
                this.notif.info('Usuario eliminado correctamente', 'Info');
                const pagina = this.usuariosPagina().length === 1 && this.paginaActual() > 1
                    ? this.paginaActual() - 1
                    : this.paginaActual();
                this.cargarPagina(pagina);
            },
            error: (err) => this.notif.error(
                err.error?.message || 'Error al eliminar el usuario', 'Error'
            )
        });
    }

    async eliminarNFC(id: number) {
        const ok = await this.confirm.abrir({ mensaje: '¿Eliminar el NFC de este usuario?', etiqueta: 'Eliminar NFC' });
        if (!ok) return;
        {
            this.usuariosService.deleteNFC(id).subscribe({
                next: () => {
                    this.notif.info('NFC eliminado correctamente', 'Info');
                    this.usuariosPagina.update(usuarios => usuarios.map(u => u.id === id ? { ...u, nfcUid: undefined } : u));
                },
                error: (err) => this.notif.error(
                    err.error?.message || 'Error al eliminar el NFC', 'Error'
                )
            });
        }
    }
}
