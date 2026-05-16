package rra.orbitcontrol.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.EventoAlmacen;
import rra.orbitcontrol.models.enums.TipoEventoAlmacen;

import java.util.List;

@Repository
public interface EventoAlmacenRepository extends JpaRepository<EventoAlmacen, Long> {

    Page<EventoAlmacen> findAllByOrderByFechaDesc(Pageable pageable);

    List<EventoAlmacen> findByProductoIdOrderByFechaDesc(Long productoId);

    List<EventoAlmacen> findByTipoOrderByFechaDesc(TipoEventoAlmacen tipo);
}
