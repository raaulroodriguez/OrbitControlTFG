import { Component, inject, OnInit } from "@angular/core";
import { DatePipe, TitleCasePipe } from "@angular/common";
import { Router } from "@angular/router";
import { DashboardCardComponent } from "../../../shared/dashboard-card/dashboard-card.component";
import { ButtonComponent } from "../../../shared/button/button.component";
import { HeladoElaboradoService } from "../../../core/services/helado-elaborado.service";
import { HeladoElaborado } from "../../../core/models/helado.model";
import { AuthService } from '../../../core/services/auth.service';

interface GrupoMovimiento {
    heladoId: number;
    tipo: string;
    nombre: string;
    fecha: string;
    cantidad: number;
    stockActual: number;
}

@Component({
    selector: 'app-helados-dashboard-card',
    standalone: true,
    imports: [DashboardCardComponent, ButtonComponent, DatePipe, TitleCasePipe],
    template: `
      <app-dashboard-card
          iconClass="fa-solid fa-down-left-and-up-right-to-center"
          iconBg="bg-[var(--primary-100)]"
          iconColor="text-[var(--primary-600)]"
          title="Últimos Movimientos"
          subtitle="Elaboraciones y consumos por lote.">

      <div class="grid grid-cols-1 gap-5 pt-1 px-2">

          <div>
            <p class="text-sm font-semibold text-[var(--primary-600)] uppercase tracking-wide mb-1">
              <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Elaborados
            </p>
            @if (elaboraciones.length === 0) {
              <p class="text-xs text-gray-400 italic text-center py-4">
                <i class="fa-regular fa-circle-xmark text-red-400 mr-1"></i>Sin elaboraciones recientes
              </p>
            }
            @for (item of elaboraciones; track item.heladoId + item.fecha) {
              <div class="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                <span class="inline-flex items-center justify-center shrink-0
                            w-6 h-6 rounded-full text-[10px] font-bold
                            bg-[var(--primary-100)] text-[var(--primary-700)]">
                    +{{ item.cantidad }}
                </span>
                <p class="text-sm text-gray-800 truncate flex-1 min-w-0">
                  {{ item.tipo | titlecase }} {{ item.nombre }}
                </p>
                <span class="text-[10px] font-semibold text-gray-400 whitespace-nowrap">{{ item.stockActual }}</span>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ item.fecha | date:'dd/MM' }}</span>
              </div>
            }
          </div>

          <div>
            <p class="text-sm font-semibold text-[var(--primary-600)] uppercase tracking-wide mb-1">
              <i class="fa-solid fa-arrow-down mr-1"></i> Consumidos
            </p>
            @if (consumidos.length === 0) {
              <p class="text-xs text-gray-400 italic text-center py-4">
                <i class="fa-regular fa-circle-xmark text-red-400 mr-1"></i>Sin consumos recientes
              </p>
            }
            @for (item of consumidos; track item.heladoId + item.fecha) {
              <div class="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                <span class="inline-flex items-center justify-center shrink-0
                            w-6 h-6 rounded-full text-[10px] font-bold
                            bg-red-100 text-red-600">
                    -{{ item.cantidad }}
                </span>
                <p class="text-sm text-gray-800 truncate flex-1 min-w-0">
                  {{ item.tipo | titlecase }} {{ item.nombre }}
                </p>
                <span class="text-[10px] font-semibold text-gray-400 whitespace-nowrap">{{ item.stockActual }}</span>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ item.fecha | date:'dd/MM' }}</span>
              </div>
            }
          </div>

        </div>

        <div footer class="flex flex-col gap-2 w-full">
          @if (auth.hasRole('ROLE_ADMIN', 'ROLE_ENCARGADO', 'ROLE_HELADERO')) {
            <app-button iconClass="fa-solid fa-magnifying-glass" text="Consultar Stock"
              contentColor="text-gray-700" bgColor="bg-white" hoverBgColor="hover:bg-gray-100"
              (click)="router.navigate(['/obrador/stock'])" />
          }
          @if (auth.hasRole('ROLE_ADMIN', 'ROLE_HELADERO')) {
            <app-button iconClass="fa-solid fa-layer-group" text="Nueva Elaboración"
              bgColor="bg-[var(--primary-600)]" hoverBgColor="hover:bg-[var(--primary-700)]"
              (click)="router.navigate(['/obrador/elaborar'])" />
          }
          <app-button iconClass="fa-solid fa-arrow-down" text="Consumir Helado"
            bgColor="bg-[var(--primary-600)]" hoverBgColor="hover:bg-[var(--primary-700)]"
            (click)="router.navigate(['/obrador/consumir'])" />
        </div>

      </app-dashboard-card>
    `
})
export class HeladosDashboardCardComponent implements OnInit {
    auth = inject(AuthService);
    router = inject(Router);
    private heladoElaboradoService = inject(HeladoElaboradoService);

    elaboraciones: GrupoMovimiento[] = [];
    consumidos:    GrupoMovimiento[] = [];

    ngOnInit(): void {
        this.heladoElaboradoService.getRecientes().subscribe(data =>
            this.elaboraciones = this.agrupar(data).slice(0, 8)
        );
        this.heladoElaboradoService.getConsumidos().subscribe(data =>
            this.consumidos = this.agrupar(data).slice(0, 8)
        );
    }

    private agrupar(items: HeladoElaborado[]): GrupoMovimiento[] {
        const map = new Map<string, GrupoMovimiento>();
        for (const item of items) {
            const dateOnly = item.fechaElaboracion.split('T')[0];
            const key = `${item.helado.id}_${dateOnly}`;
            const existing = map.get(key);
            if (existing) {
                existing.cantidad += 1;
            } else {
                map.set(key, {
                    heladoId: item.helado.id,
                    tipo: item.helado.tipo,
                    nombre: item.helado.nombre,
                    fecha: dateOnly,
                    cantidad: 1,
                    stockActual: item.helado.stockActual,
                });
            }
        }
        return Array.from(map.values());
    }
}
