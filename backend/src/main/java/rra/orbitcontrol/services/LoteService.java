package rra.orbitcontrol.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.LoteMapper;
import rra.orbitcontrol.models.dtos.responses.LoteDTO;
import rra.orbitcontrol.models.entities.Lote;
import rra.orbitcontrol.models.enums.TipoEntidadLote;
import rra.orbitcontrol.repositories.LoteRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoteService {

    private final LoteRepository loteRepository;
    private final LoteMapper     loteMapper;

    public LoteService(LoteRepository loteRepository, LoteMapper loteMapper) {
        this.loteRepository = loteRepository;
        this.loteMapper     = loteMapper;
    }

    public List<LoteDTO> all() {
        return loteMapper.toDtoList(loteRepository.findAll());
    }

    public LoteDTO one(Long id) {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("lote", id));
        return loteMapper.toDto(lote);
    }

    public List<LoteDTO> findByEntidad(TipoEntidadLote tipoEntidad, Long entidadId) {
        return loteMapper.toDtoList(loteRepository.findByTipoEntidadAndEntidadId(tipoEntidad, entidadId));
    }

    public List<LoteDTO> findByPedido(Long pedidoId) {
        return loteMapper.toDtoList(loteRepository.findByPedidoId(pedidoId));
    }

    public List<LoteDTO> findProximosCaducar(int dias) {
        LocalDateTime limite = LocalDateTime.now().plusDays(dias);
        return loteMapper.toDtoList(loteRepository.findProximosCaducar(limite));
    }

    @Transactional
    public LoteDTO save(Lote lote) {
        return loteMapper.toDto(loteRepository.save(lote));
    }

    @Transactional
    public LoteDTO replace(Long id, Lote lote) {
        loteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("lote", id));
        lote.setId(id);
        return loteMapper.toDto(loteRepository.save(lote));
    }

    @Transactional
    public void delete(Long id) {
        if (!loteRepository.existsById(id)) {
            throw new EntityNotFoundException("lote", id);
        }
        loteRepository.deleteById(id);
    }
}
