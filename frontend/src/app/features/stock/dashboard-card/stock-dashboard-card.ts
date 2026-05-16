import { Component, inject, OnInit } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { DashboardCardComponent } from "../../../shared/dashboard-card/dashboard-card.component";
import { ButtonComponent } from "../../../shared/button/button.component";
import { HeladoService } from "../../../core/services/helado.service";
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/notification/notification.service';
import { Helado } from "../../../core/models/helado.model";
import { Producto } from "../../../core/models/producto.model";
import { ProductoService } from "../../../core/services/producto.service";

@Component({
    selector: 'app-stock-dashboard-card',
    standalone: true,
    imports: [DashboardCardComponent, ButtonComponent, TitleCasePipe],
    template: `
      <app-dashboard-card
          iconClass="fa-solid fa-triangle-exclamation"
          iconBg="bg-[var(--primary-100)]"
          iconColor="text-[var(--primary-600)]"
          title="Alertas de Stock"
          subtitle="Productos por debajo del stock mínimo.">

      <div class="grid grid-cols-1 gap-5 pt-1 px-2">
        <div>
          <p class="text-sm font-semibold text-[var(--primary-600)] uppercase tracking-wide mb-1">
            <i class="fa-solid fa-clipboard-list mr-1"></i> Obrador
          </p>
            @if (alertasObrador.length === 0) {
              <p class="text-xs text-gray-400 italic text-center py-4">
                <i class="fa-solid fa-circle-check text-green-400 mr-1"></i>Sin alertas de stock
              </p>
            }
            @for (h of alertasObrador; track h.id) {
              <div class="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <p class="text-sm font-medium text-[var(--gray-800)]">
                  {{ h.tipo | titlecase }} {{ h.nombre }}
                </p>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                  Stock: {{ h.stockActual }}
                </span>
              </div>
            }
          </div>

        <div>
          <p class="text-sm font-semibold text-[var(--primary-600)] uppercase tracking-wide mb-1">
            <i class="fa-solid fa-box-archive mr-1"></i> Almacén
          </p>
            @if (alertasAlmacen.length === 0) {
              <p class="text-xs text-gray-400 italic text-center py-4">
                <i class="fa-solid fa-circle-check text-green-400 mr-1"></i>Sin alertas de stock
              </p>
            }
            @for (p of alertasAlmacen; track p.id) {
              <div class="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <p class="text-sm font-medium text-[var(--gray-800)]">
                  {{ p.nombre }}
                </p>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                  Stock: {{ p.stockActual }}
                </span>
              </div>
            }
          </div>
      </div>

        <div footer class="flex flex-col gap-2 w-full">
          @if (auth.hasRole('ROLE_ADMIN', 'ROLE_ENCARGADO')) {
            <app-button iconClass="fa-solid fa-bell" text="Enviar Alerta"
              contentColor="text-gray-700" bgColor="bg-white" hoverBgColor="hover:bg-gray-100"
              (click)="enviarAlertas()" />
          }
          <app-button iconClass="fa-solid fa-box" text="Ver Inventario"
            bgColor="bg-[var(--primary-600)]" hoverBgColor="hover:bg-[var(--primary-700)]"
            (click)="router.navigate(['/almacen/gestion'])" />

        </div>

      </app-dashboard-card>
    `
})
export class StockDashboardCardComponent implements OnInit {
    auth = inject(AuthService);
    router = inject(Router);
    private heladoService = inject(HeladoService);
    private productoService = inject(ProductoService);
    private notif = inject(NotificationService);

    alertasObrador: Helado[] = [];
    alertasAlmacen: Producto[] = [];

    ngOnInit(): void {
        this.heladoService.getStockBajo().subscribe(data => this.alertasObrador = data);
        this.productoService.getStockBajo().subscribe(data => this.alertasAlmacen = data);
    }

    enviarAlertas(): void {
        forkJoin([
            this.heladoService.enviarTodasAlertas(),
            this.productoService.enviarTodasAlertas()
        ]).subscribe({
            next: () => this.notif.success('Alertas de stock enviadas correctamente', 'Alertas'),
            error: () => this.notif.error('Error al enviar las alertas de stock', 'Error')
        });
    }
}
