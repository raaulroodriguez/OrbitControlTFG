package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rra.orbitcontrol.models.dtos.responses.ItemPlantillaPedidoDTO;
import rra.orbitcontrol.models.dtos.responses.PlantillaPedidoDTO;
import rra.orbitcontrol.models.entities.ItemPlantillaPedido;
import rra.orbitcontrol.models.entities.PlantillaPedido;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProveedorMapper.class})
public interface PlantillaPedidoMapper {

    PlantillaPedidoDTO toDto(PlantillaPedido plantilla);

    @Mapping(source = "producto.id",     target = "productoId")
    @Mapping(source = "producto.nombre", target = "productoNombre")
    ItemPlantillaPedidoDTO toItemDto(ItemPlantillaPedido item);

    List<PlantillaPedidoDTO> toDtoList(List<PlantillaPedido> list);
}
