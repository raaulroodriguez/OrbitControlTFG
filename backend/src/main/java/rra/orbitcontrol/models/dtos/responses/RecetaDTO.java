package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.TipoHelado;
import rra.orbitcontrol.models.enums.TipoReceta;

import java.util.List;

@Getter
@Setter
public class RecetaDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private boolean activo;
    private TipoReceta tipoReceta;
    private TipoHelado tipoHelado;
    private List<IngredienteRecetaDTO> ingredientes;
    private double costeElaboracion;
}
