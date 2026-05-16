package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.EstadoProducto;

import java.time.LocalDateTime;

@Getter
@Setter
public class HeladoElaboradoDTO {

    private Long id;
    private HeladoDTO helado;
    private String codigoProd;
    private LocalDateTime fechaElaboracion;
    private LocalDateTime fechaCaducidad;
    private EstadoProducto estado;
}
