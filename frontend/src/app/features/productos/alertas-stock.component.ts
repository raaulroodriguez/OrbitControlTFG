import { Component, OnInit, signal, inject } from '@angular/core';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { AlertCardComponent } from '../../shared/alert-card/alert-card.component';
import { ToolbarButtonComponent } from '../../shared/section-header/toolbar-button.component';
import { Producto, UNIDADES_MEDIDA } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';
import { BaseComponent } from '../../core/base/base.component';

@Component({
    selector: 'app-alertas-stock',
    standalone: true,
    imports: [SectionHeaderComponent, AlertCardComponent, ToolbarButtonComponent],
    template: `
        <app-section-header
            title="Alertas de Stock"
            subtitle="Productos por debajo del stock mínimo"
            icon="fas fa-triangle-exclamation">
            @if (productos().length > 0) {
                <app-toolbar-button toolbar text="Enviar todas las alertas" icon="fa-solid fa-bell" (click)="enviarTodas()"/>
            }
        </app-section-header>

        @if (productos().length > 0) {
            <div class="flex flex-col items-center gap-1 mt-6 mb-2">
                <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-600 text-sm font-semibold">
                    <i class="fa-solid fa-triangle-exclamation text-xs"></i>
                    {{ productos().length }} productos en alerta
                </span>
            </div>
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            @for (p of productos(); track p.id) {
                <app-alert-card
                    [nombre]="p.nombre"
                    [subtitulo]="p.proveedor?.nombre || 'Sin proveedor'"
                    [icono]="iconoPorTipo(p.tipoProducto)"
                    [fields]="[
                        {label: 'Actual',  value: p.stockActual,              unit: um[p.unidadMedida].abreviatura, color: 'red'},
                        {label: 'Mínimo',  value: p.stockMinimo,              unit: um[p.unidadMedida].abreviatura, color: 'orange'},
                        {label: 'Faltan',  value: p.stockMinimo - p.stockActual, unit: um[p.unidadMedida].abreviatura, color: 'red'}
                    ]"
                    [enviando]="enviando() === p.id"
                    (verDetalle)="router.navigate(['/almacen/detalles', p.id])"
                    (enviarAlerta)="enviarAlerta(p)"/>
            }
        </div>

        @if (!cargando() && productos().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 gap-3">
                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <i class="fa-solid fa-check text-2xl text-green-600"></i>
                </div>
                <p class="text-slate-700 font-semibold">Todo en orden</p>
                <p class="text-sm text-slate-400">No hay productos por debajo del stock mínimo</p>
            </div>
        }
    `
})
export class AlertasStockComponent extends BaseComponent implements OnInit {
    private productoService = inject(ProductoService);

    readonly um = UNIDADES_MEDIDA;

    productos = signal<Producto[]>([]);
    cargando = signal(true);
    enviando = signal<number | null>(null);
    enviandoTodas = signal(false);

    ngOnInit() {
        this.productoService.getStockBajo(0, 100).subscribe({
            next: (res) => { this.productos.set(res); this.cargando.set(false); },
            error: () => { this.notif.error('Error al cargar las alertas', 'Error'); this.cargando.set(false); }
        });
    }

    enviarAlerta(p: Producto) {
        this.enviando.set(p.id);
        this.productoService.enviarAlerta(p.id).subscribe({
            next: () => { this.notif.info('Alerta enviada a los encargados', 'Alerta'); this.enviando.set(null); },
            error: () => { this.notif.error('Error al enviar la alerta', 'Error'); this.enviando.set(null); }
        });
    }

    enviarTodas() {
        this.enviandoTodas.set(true);
        this.productoService.enviarTodasAlertas().subscribe({
            next: () => { this.notif.info('Alertas enviadas a los encargados', 'Alerta'); this.enviandoTodas.set(false); },
            error: () => { this.notif.error('Error al enviar las alertas', 'Error'); this.enviandoTodas.set(false); }
        });
    }

    iconoPorTipo(tipo: string | undefined): string {
        if (tipo === 'OBRADOR') return 'fa-utensils';
        if (tipo === 'TIENDA')  return 'fa-shop';
        return 'fa-boxes-stacked';
    }
}
