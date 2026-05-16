package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.TipoProducto;

@Getter
@Setter
public class ProveedorDTO {

    private Long id;
    private String nombre;
    private String nif;
    private String telefono;
    private String email;
    private String direccion;
    private TipoProducto tipoProducto;
    private boolean activo;
}
