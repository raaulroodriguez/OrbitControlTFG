package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.TipoEventoAlmacen;

import java.time.LocalDateTime;

@Getter
@Setter
public class EventoAlmacenDTO {
    private Long          id;
    private Long          productoId;
    private String        productoNombre;
    private TipoEventoAlmacen tipo;
    private double        cantidad;
    private String        motivo;
    private LocalDateTime fecha;
}
