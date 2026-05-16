package rra.orbitcontrol.models.dtos.requests;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.EstadoPedido;

@Getter
@Setter
public class CambiarEstadoPedidoRequest {
    private EstadoPedido estado;
}
