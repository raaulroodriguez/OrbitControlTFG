package rra.orbitcontrol.models.dtos.requests;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlantillaPedidoRequest {
    private String nombre;
    private String descripcion;
    private Long proveedorId;
    private String observaciones;
    private List<ItemPlantillaPedidoRequest> items;
}
