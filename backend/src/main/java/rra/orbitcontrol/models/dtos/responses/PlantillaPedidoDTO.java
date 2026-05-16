package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlantillaPedidoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private ProveedorDTO proveedor;
    private String observaciones;
    private boolean activo;
    private List<ItemPlantillaPedidoDTO> items;
}
