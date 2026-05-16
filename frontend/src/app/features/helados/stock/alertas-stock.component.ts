import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { AlertCardComponent } from '../../../shared/alert-card/alert-card.component';
import { ToolbarButtonComponent } from '../../../shared/section-header/toolbar-button.component';
import { Helado } from '../../../core/models/helado.model';
import { HeladoService } from '../../../core/services/helado.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
    selector: 'app-alertas-stock-helados',
    standalone: true,
    imports: [SectionHeaderComponent, AlertCardComponent, ToolbarButtonComponent],
    template: `
        <app-section-header
            title="Alertas de Stock"
            subtitle="Helados por debajo del stock mínimo"
            icon="fas fa-triangle-exclamation">
            @if (helados().length > 0) {
                <app-toolbar-button toolbar text="Enviar todas las alertas" icon="fa-solid fa-bell" (click)="enviarTodas()"/>
            }
        </app-section-header>

        @if (helados().length > 0) {
            <div class="flex flex-col items-center gap-1 mt-6 mb-2">
                <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-600 text-sm font-semibold">
                    <i class="fa-solid fa-triangle-exclamation text-xs"></i>
                    {{ helados().length }} helados en alerta · {{ totalFaltan() }} ud. a reponer
                </span>
            </div>
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            @for (h of helados(); track h.id) {
                <app-alert-card
                    [nombre]="h.nombre"
                    [subtitulo]="h.tipo === 'BARQUETA' ? 'Barqueta' : 'Paleta'"
                    [icono]="h.tipo === 'BARQUETA' ? 'fa-ice-cream' : 'fa-candy-cane'"
                    [badge]="h.costeProducion + '€/ud'"
                    [fields]="[
                        { label: 'Stock actual', value: h.stockActual, unit: 'ud', color: 'red' },
                        { label: 'Mínimo', value: h.stockMinimo, unit: 'ud', color: 'slate' },
                        { label: 'Faltan', value: h.stockMinimo - h.stockActual, unit: 'ud', color: 'orange' }
                    ]"
                    [enviando]="enviando() === h.id"
                    (verDetalle)="router.navigate(['/obrador/detalles', h.id])"
                    (enviarAlerta)="enviarAlerta(h)"/>
            }
        </div>

        @if (!cargando() && helados().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 gap-3">
                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <i class="fa-solid fa-check text-2xl text-green-600"></i>
                </div>
                <p class="text-slate-700 font-semibold">Todo en orden</p>
                <p class="text-sm text-slate-400">No hay helados por debajo del stock mínimo</p>
            </div>
        }
    `
})
export class AlertasStockHeladosComponent extends BaseComponent implements OnInit {
    private heladoService = inject(HeladoService);

    helados = signal<Helado[]>([]);
    cargando = signal(true);
    enviando = signal<number | null>(null);
    enviandoTodas = signal(false);

    totalFaltan = computed(() => this.helados().reduce((acc, h) => acc + (h.stockMinimo - h.stockActual), 0));

    ngOnInit() {
        this.heladoService.getStockBajo(0, 100).subscribe({
            next: (res) => { this.helados.set(res); this.cargando.set(false); },
            error: () => { this.notif.error('Error al cargar las alertas', 'Error'); this.cargando.set(false); }
        });
    }

    enviarAlerta(h: Helado) {
        this.enviando.set(h.id);
        this.heladoService.enviarAlerta(h.id).subscribe({
            next: () => { this.notif.info('Alerta enviada a los heladeros', 'Alerta'); this.enviando.set(null); },
            error: () => { this.notif.error('Error al enviar la alerta', 'Error'); this.enviando.set(null); }
        });
    }

    enviarTodas() {
        this.enviandoTodas.set(true);
        this.heladoService.enviarTodasAlertas().subscribe({
            next: () => { this.notif.info('Alertas enviadas a los heladeros', 'Alerta'); this.enviandoTodas.set(false); },
            error: () => { this.notif.error('Error al enviar las alertas', 'Error'); this.enviandoTodas.set(false); }
        });
    }
}
