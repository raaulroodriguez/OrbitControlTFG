package rra.orbitcontrol.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.ProductoPedido;

@Repository
public interface ProductoPedidoRepository extends JpaRepository<ProductoPedido, Long> {
}
