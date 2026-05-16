package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.EstadoPedido;
import rra.orbitcontrol.models.enums.TipoProducto;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PedidoDTO {

    private Long id;
    private String codigoPedido;
    private ProveedorDTO proveedor;
    private TipoProducto tipoProductoPedido;
    private LocalDateTime fechaPedido;
    private LocalDateTime fechaEntrega;
    private EstadoPedido estado;
    private LocalDateTime fechaRecibido;
    private String observaciones;
    private List<ItemPedidoDTO> items;
}
