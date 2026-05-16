import { Component, inject } from '@angular/core';
import { PedidosDashboardCardComponent } from '../pedidos/dashboard-card/pedidos-dashboard-card';
import { StockDashboardCardComponent } from '../stock/dashboard-card/stock-dashboard-card';
import { HeladosDashboardCardComponent } from '../helados/dashboard-card/helados-dashboard-card';
import { AuthService } from '../../core/services/auth.service';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { PushPermissionModalComponent } from '../../shared/push-permission-modal/push-permission-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PedidosDashboardCardComponent,
    StockDashboardCardComponent,
    HeladosDashboardCardComponent,
    PushPermissionModalComponent,
  ],
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 p-1">
      <app-pedidos-dashboard-card />
      <app-helados-dashboard-card />
      <app-stock-dashboard-card />
    </div>

    @if (mostrarModal) {
      <app-push-permission-modal
        (activar)="activarPush()"
        (omitir)="mostrarModal = false" />
    }
  `
})
export class DashboardComponent {
  auth        = inject(AuthService);
  pushService = inject(PushNotificationService);

  mostrarModal = typeof Notification !== 'undefined' && Notification.permission === 'default';

  activarPush() {
    this.pushService.inicializar().catch(err => console.error('[Push] init failed:', err));
    this.mostrarModal = false;
  }
}
