package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.TipoHelado;

@Getter
@Setter
public class HeladoDTO {

    private Long id;
    private String nombre;
    private TipoHelado tipo;
    private RecetaDTO receta;
    private Integer stockActual;
    private Integer stockMinimo;
    private double costeProducion;
    private boolean activo;
}
