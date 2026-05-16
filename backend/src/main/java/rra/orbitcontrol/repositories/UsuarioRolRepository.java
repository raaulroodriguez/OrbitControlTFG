package rra.orbitcontrol.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.UsuarioRol;
import rra.orbitcontrol.models.enums.RolNombre;

import java.util.List;

@Repository
public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, Long> {

    @Query("SELECT DISTINCT ur.rol FROM UsuarioRol ur ORDER BY ur.rol")
    List<RolNombre> findRolesDisponibles();
}