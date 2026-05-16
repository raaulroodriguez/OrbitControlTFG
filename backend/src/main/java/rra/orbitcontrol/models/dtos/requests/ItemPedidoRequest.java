package rra.orbitcontrol.models.dtos.requests;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemPedidoRequest {
    private Long productoId;
    private double cantidadSolicitada;
    private double precio;
}
