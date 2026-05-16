package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.UnidadMedida;

@Getter
@Setter
public class IngredienteRecetaDTO {

    private Long id;
    private ProductoDTO producto;
    private Long subrecetaId;
    private String subrecetaNombre;
    private double subrecetaCoste;
    private double cantidad;
    private Double cantidadOriginal;
    private UnidadMedida unidadOriginal;
}
