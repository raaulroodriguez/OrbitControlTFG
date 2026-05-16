package rra.orbitcontrol.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import rra.orbitcontrol.models.entities.PlantillaPedido;

import java.util.List;

public interface PlantillaPedidoRepository extends JpaRepository<PlantillaPedido, Long> {
    List<PlantillaPedido> findByActivoTrue();
}
