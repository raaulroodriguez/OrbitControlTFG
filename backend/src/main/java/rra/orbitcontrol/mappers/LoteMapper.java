package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import rra.orbitcontrol.models.dtos.responses.LoteDTO;
import rra.orbitcontrol.models.entities.Lote;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LoteMapper {

    Lote toEntity(LoteDTO loteDto);

    LoteDTO toDto(Lote lote);

    List<LoteDTO> toDtoList(List<Lote> lotes);
}
