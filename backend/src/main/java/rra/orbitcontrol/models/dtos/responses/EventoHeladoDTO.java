package rra.orbitcontrol.models.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EventoHeladoDTO {
    private Long          heladoId;
    private String        nombre;
    private String        tipo;
    private Long          cantidad;
    private LocalDateTime fechaUltimaElaboracion;
    private Long          stockActual;
}
