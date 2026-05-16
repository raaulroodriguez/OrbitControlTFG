package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import rra.orbitcontrol.models.dtos.responses.HeladoDTO;
import rra.orbitcontrol.models.entities.Helado;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RecetaMapper.class})
public interface HeladoMapper {

    HeladoDTO toDto(Helado helado);

    List<HeladoDTO> toDtoList(List<Helado> helados);
}
