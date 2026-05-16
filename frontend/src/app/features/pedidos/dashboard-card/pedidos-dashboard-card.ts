import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardCardComponent } from '../../../shared/dashboard-card/dashboard-card.component';
import { PedidoService } from '../../../core/services/pedido.service';
import { Pedido } from '../../../core/models/pedido.model';
import { ButtonComponent } from '../../../shared/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pedidos-dashboard-card',
  standalone: true,
  imports: [DashboardCardComponent, RouterLink, ButtonComponent],
  template: `
    <app-dashboard-card
        iconClass="fa-solid fa-truck-ramp-box"
        iconBg="bg-[var(--primary-100)]"
        iconColor="text-[var(--primary-600)]"
        title="Pedidos Pendientes"
        subtitle="Entregas previstas.">

      <div class="border-l-2 border-dashed border-gray-200 ml-4 space-y-6 mt-3">
        @for (pedido of pedidosEnviados.slice(0, 5); track pedido.id; let i = $index) {
          <div class="relative pl-6">
            <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white"
                 [class]="i === 0 ? 'bg-[var(--primary-600)]' : 'bg-gray-300'"></div>
            <p class="text-xs font-bold capitalize"
               [class]="i === 0 ? 'text-[var(--primary-600)]' : 'text-gray-500'">
              {{ getFecha(pedido.fechaEntrega) }}
            </p>
            <p class="text-xs font-medium text-slate-700">{{ pedido.proveedor.nombre }}
              <span class="text-[var(--primary-600)] hover:text-[var(--slate-900)]">
                <a [routerLink]="['/pedidos/detalles', pedido.id]">({{ pedido.codigoPedido }})</a>
              </span>
            </p>
          </div>
        } @empty {
          <p class="text-xs text-gray-400 italic text-center py-4">
            <i class="fa-solid fa-circle-check text-green-400 mr-1"></i>
            No hay pedidos próximos
          </p>
        }
      </div>

      <div footer class="flex flex-col gap-2 w-full">
        @if (auth.hasPermission()) {
        <app-button iconClass="fa-solid fa-cart-plus" text="Nuevo Pedido"
        contentColor="text-gray-700" bgColor="bg-white" hoverBgColor="hover:bg-gray-100"
        (click)="router.navigate(['/pedidos/nuevo'])" />
        }
        <app-button iconClass="fa-solid fa-list-check" text="Gestionar Pedidos"
          bgColor="bg-[var(--primary-600)]" hoverBgColor="hover:bg-[var(--primary-700)]"
          (click)="router.navigate(['/pedidos/pendientes'])" />
      </div>

    </app-dashboard-card>
  `
})
export class PedidosDashboardCardComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  private pedidoService = inject(PedidoService);
  pedidosEnviados: Pedido[] = [];

  ngOnInit(): void {
    this.pedidoService.getAll().subscribe({
      next: (pedidos) => {
        this.pedidosEnviados = pedidos
          .filter(p => p.estado === 'PENDIENTE')
          .sort((a, b) =>
            new Date(a.fechaEntrega ?? '').getTime() -
            new Date(b.fechaEntrega ?? '').getTime()
          );
      },
      error: () => { this.pedidosEnviados = []; }
    });
  }

  getFecha(fecha: string | undefined): string {
    if (!fecha) return 'Sin fecha';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fecha);
    entrega.setHours(0, 0, 0, 0);
    const diffDias = Math.round((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Mañana';
    return entrega.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}
