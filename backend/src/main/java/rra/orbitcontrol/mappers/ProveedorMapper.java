package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import rra.orbitcontrol.models.dtos.responses.ProveedorDTO;
import rra.orbitcontrol.models.entities.Proveedor;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProveedorMapper {

    ProveedorDTO toDto(Proveedor proveedor);

    List<ProveedorDTO> toDtoList(List<Proveedor> proveedores);
}
