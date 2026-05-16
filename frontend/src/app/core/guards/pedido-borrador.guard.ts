import { CanDeactivateFn } from '@angular/router';
import { NuevoPedidoComponent } from '../../features/pedidos/nuevo-pedido.component';

// Pregunta al componente si se puede salir; si hay un pedido a medias muestra el modal de borrador
export const pedidoBorradorGuard: CanDeactivateFn<NuevoPedidoComponent> = (component) => {
    return component.canDeactivate();
};
