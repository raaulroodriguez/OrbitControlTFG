package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rra.orbitcontrol.models.dtos.responses.IngredienteRecetaDTO;
import rra.orbitcontrol.models.entities.IngredienteReceta;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProductoMapper.class})
public interface IngredienteRecetaMapper {

    @Mapping(target = "producto",        source = "producto")
    @Mapping(target = "subrecetaId",     source = "subreceta.id")
    @Mapping(target = "subrecetaNombre", source = "subreceta.nombre")
    @Mapping(target = "subrecetaCoste",  ignore = true) // calculado en RecetaService.enriquecerSubrecetaCostes()
    IngredienteRecetaDTO toDto(IngredienteReceta ingredienteReceta);

    List<IngredienteRecetaDTO> toDtoList(List<IngredienteReceta> ingredientes);
}
