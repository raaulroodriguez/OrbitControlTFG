package rra.orbitcontrol.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rra.orbitcontrol.models.entities.DispositivoToken;
import rra.orbitcontrol.models.enums.RolNombre;
import java.util.List;
import java.util.Optional;

public interface DispositivoTokenRepository extends JpaRepository<DispositivoToken, Long> {

    List<DispositivoToken> findByUsuarioId(Long usuarioId);

    Optional<DispositivoToken> findByToken(String token);

    @Query("SELECT d FROM DispositivoToken d JOIN d.usuario u JOIN u.roles r WHERE r.rol = :rol")
    List<DispositivoToken> findByRol(@Param("rol") RolNombre rol);
}
