package rra.orbitcontrol.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.Pedido;

import java.time.LocalDateTime;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    long countByFechaPedidoBetween(LocalDateTime localDateTime, LocalDateTime localDateTime1);
}
