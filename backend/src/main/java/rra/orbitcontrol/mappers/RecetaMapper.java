package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import rra.orbitcontrol.models.dtos.responses.RecetaDTO;
import rra.orbitcontrol.models.entities.Receta;

import java.util.List;

@Mapper(componentModel = "spring", uses = {IngredienteRecetaMapper.class})
public interface RecetaMapper {

    RecetaDTO toDto(Receta receta);

    List<RecetaDTO> toDtoList(List<Receta> recetas);
}
