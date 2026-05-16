package rra.orbitcontrol.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.HeladoElaborado;
import rra.orbitcontrol.models.enums.EstadoProducto;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HeladoElaboradoRepository extends JpaRepository<HeladoElaborado, Long> {

    long countByHeladoId(Long heladoId);

    long countByHeladoIdAndFechaElaboracionBetween(Long id, LocalDateTime inicio, LocalDateTime fin);

    List<HeladoElaborado> findTop10ByOrderByFechaElaboracionDesc();

    List<HeladoElaborado> findTop10ByEstadoOrderByFechaElaboracionDesc(EstadoProducto estado);

    List<HeladoElaborado> findByHeladoIdAndEstadoOrderByFechaElaboracionAsc(Long heladoId, EstadoProducto estado);

    @Query("SELECT h.helado.id, h.helado.nombre, h.helado.tipo, " +
           "COUNT(h), MAX(h.fechaElaboracion), h.helado.stockActual " +
           "FROM HeladoElaborado h " +
           "GROUP BY h.helado.id, h.helado.nombre, h.helado.tipo, h.helado.stockActual " +
           "ORDER BY MAX(h.fechaElaboracion) DESC")
    List<Object[]> findRecientesAgrupados(Pageable pageable);

    @Query("SELECT h.helado.id, h.helado.nombre, h.helado.tipo, " +
           "COUNT(h), MAX(h.fechaElaboracion), h.helado.stockActual " +
           "FROM HeladoElaborado h " +
           "WHERE h.estado = :estado " +
           "GROUP BY h.helado.id, h.helado.nombre, h.helado.tipo, h.helado.stockActual " +
           "ORDER BY MAX(h.fechaElaboracion) DESC")
    List<Object[]> findConsumidosAgrupados(@Param("estado") EstadoProducto estado, Pageable pageable);
}
