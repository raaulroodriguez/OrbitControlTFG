package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.TipoEntidadLote;

import java.time.LocalDateTime;

@Getter
@Setter
public class LoteDTO {

    private Long id;
    private TipoEntidadLote tipoEntidad;
    private Long entidadId;
    private double cantidad;
    private LocalDateTime fechaCaducidad;
    private LocalDateTime fechaEntrada;
    private Long pedidoId;
    private String observaciones;
}
