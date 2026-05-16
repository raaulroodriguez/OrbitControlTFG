package rra.orbitcontrol.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.Lote;
import rra.orbitcontrol.models.enums.TipoEntidadLote;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByTipoEntidadAndEntidadId(TipoEntidadLote tipoEntidad, Long entidadId);

    List<Lote> findByPedidoId(Long pedidoId);

    @Query("SELECT l FROM Lote l WHERE l.fechaCaducidad IS NOT NULL AND l.fechaCaducidad <= :limite ORDER BY l.fechaCaducidad ASC")
    List<Lote> findProximosCaducar(@Param("limite") LocalDateTime limite);

    @Query("SELECT l FROM Lote l WHERE l.tipoEntidad = :tipoEntidad ORDER BY l.fechaCaducidad ASC")
    List<Lote> findByTipoEntidad(@Param("tipoEntidad") TipoEntidadLote tipoEntidad);
}
