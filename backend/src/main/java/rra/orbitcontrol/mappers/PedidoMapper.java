package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rra.orbitcontrol.models.dtos.responses.ItemPedidoDTO;
import rra.orbitcontrol.models.dtos.responses.PedidoDTO;
import rra.orbitcontrol.models.entities.Pedido;
import rra.orbitcontrol.models.entities.ProductoPedido;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProveedorMapper.class})
public interface PedidoMapper {

    PedidoDTO toDto(Pedido pedido);

    List<PedidoDTO> toDtoList(List<Pedido> pedidos);

    @Mapping(source = "producto.id",                 target = "productoId")
    @Mapping(source = "producto.nombre",             target = "productoNombre")
    @Mapping(source = "producto.envase",             target = "envase")
    @Mapping(source = "producto.contenidoPorUnidad", target = "contenidoPorUnidad")
    @Mapping(source = "producto.unidadMedida",       target = "unidadMedida")
    ItemPedidoDTO toItemDto(ProductoPedido item);
}
