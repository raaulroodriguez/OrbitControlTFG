package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemPedidoDTO {
    private Long   id;
    private Long   productoId;
    private String productoNombre;
    private double cantidadSolicitada;
    private double precio;
    private String envase;
    private double contenidoPorUnidad;
    private String unidadMedida;
}
