package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import rra.orbitcontrol.models.dtos.responses.ProductoDTO;
import rra.orbitcontrol.models.entities.Producto;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProveedorMapper.class})
public interface ProductoMapper {

    Producto toEntity(ProductoDTO productoDto);

    ProductoDTO toDto(Producto producto);

    List<ProductoDTO> toDtoList(List<Producto> productos);
}
