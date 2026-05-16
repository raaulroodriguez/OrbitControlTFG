package rra.orbitcontrol.models.dtos.requests;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class NuevoPedidoRequest {
    private Long proveedorId;
    private LocalDateTime fechaEntrega;
    private String observaciones;
    private List<ItemPedidoRequest> items;
}
