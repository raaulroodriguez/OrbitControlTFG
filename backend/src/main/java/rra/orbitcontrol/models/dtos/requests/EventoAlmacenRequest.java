package rra.orbitcontrol.models.dtos.requests;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.TipoEventoAlmacen;

@Getter
@Setter
public class EventoAlmacenRequest {
    private Long           productoId;
    private TipoEventoAlmacen tipo;
    private double         cantidad;
    private String         motivo;
}
