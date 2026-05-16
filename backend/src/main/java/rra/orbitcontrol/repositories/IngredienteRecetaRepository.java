package rra.orbitcontrol.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.IngredienteReceta;

@Repository
public interface IngredienteRecetaRepository extends JpaRepository<IngredienteReceta, Long> {

    List<IngredienteReceta> findByRecetaId(Long recetaId);
}
