package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemPlantillaPedidoDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private double cantidadSolicitada;
    private double precio;
}
