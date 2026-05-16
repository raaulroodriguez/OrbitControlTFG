package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import rra.orbitcontrol.models.dtos.responses.HeladoElaboradoDTO;
import rra.orbitcontrol.models.entities.HeladoElaborado;

import java.util.List;

@Mapper(componentModel = "spring", uses = {HeladoMapper.class})
public interface HeladoElaboradoMapper {

    HeladoElaboradoDTO toDto(HeladoElaborado heladoElaborado);

    List<HeladoElaboradoDTO> toDtoList(List<HeladoElaborado> heladosElaborados);
}
