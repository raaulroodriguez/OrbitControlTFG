package rra.orbitcontrol.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.models.entities.Usuario;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    List<Usuario> findByNombreContainingIgnoreCaseOrApellidosContainingIgnoreCase(String nombre, String apellidos);

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    Optional<Usuario> findFirstByNombreUsuario(String nombreUsuario);

    Optional<Usuario> findByNfcUid(String nfcUid);

    Optional<Usuario> findByDni(String dni);

    boolean existsByEmail(String email);

    boolean existsByNombreUsuario(String nombreUsuario);

    List<Usuario> findByActivoTrue();

    @Query("SELECT u FROM Usuario u JOIN u.roles ur WHERE ur.rol = :rol")
    List<Usuario> findByRol(RolNombre rol);

    @Query("SELECT DISTINCT u FROM Usuario u LEFT JOIN FETCH u.roles")
    List<Usuario> findAllWithRoles();

    @Query("SELECT u FROM Usuario u WHERE " +
            "LOWER(u.nombre)        LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.apellidos)     LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email)         LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.nombreUsuario) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "u.telefono             LIKE CONCAT('%', :search, '%')")
    Page<Usuario> searchPaged(@Param("search") String search, Pageable pageable);

    @Query("SELECT u FROM Usuario u JOIN u.roles ur WHERE ur.rol = :rol")
    Page<Usuario> findByRolPaged(@Param("rol") RolNombre rol, Pageable pageable);

    @Query("SELECT u FROM Usuario u JOIN u.roles ur WHERE ur.rol = :rol AND (" +
            "LOWER(u.nombre)        LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.apellidos)     LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email)         LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.nombreUsuario) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "u.telefono             LIKE CONCAT('%', :search, '%'))")
    Page<Usuario> searchPagedByRol(@Param("search") String search, @Param("rol") RolNombre rol, Pageable pageable);

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.roles WHERE u.nombreUsuario = :username")
    Optional<Usuario> findByNombreUsuarioWithRoles(@Param("username") String username);

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.roles WHERE u.nfcUid = :nfcUid")
    Optional<Usuario> findByNfcUidWithRoles(@Param("nfcUid") String nfcUid);
}
