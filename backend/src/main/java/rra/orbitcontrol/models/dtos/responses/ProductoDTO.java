package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.Envase;
import rra.orbitcontrol.models.enums.TipoProducto;
import rra.orbitcontrol.models.enums.UnidadMedida;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProductoDTO {

    private Long id;
    private String nombre;
    private LocalDateTime fechaCaducidad;
    private double precio;
    private UnidadMedida unidadMedida;
    private double stockActual;
    private double stockMinimo;
    private TipoProducto tipoProducto;
    private Envase envase;
    private double contenidoPorUnidad;
    private ProveedorDTO proveedor;
}
