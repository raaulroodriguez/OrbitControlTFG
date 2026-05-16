package rra.orbitcontrol.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.Proveedor;
import rra.orbitcontrol.models.enums.TipoProducto;

import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {

    Optional<Proveedor> findByNombreContainingIgnoreCase(String nombre);

    Optional<Proveedor> findByNif(String nif);

    boolean existsByNif(String nif);

    Optional<Proveedor> findByTelefono(String telefono);

    @Query("SELECT p FROM Proveedor p WHERE " +
        "LOWER(p.nombre)        LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.nif)           LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.direccion)     LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.email)         LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.tipoProducto)  LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "p.telefono             LIKE CONCAT('%', :search, '%')")
    Page<Proveedor> searchPaged(@Param("search") String search, Pageable pageable);

    Page<Proveedor> findByTipoProducto(TipoProducto tipoProducto, Pageable pageable);

    @Query("SELECT p FROM Proveedor p WHERE p.tipoProducto = :tipo AND (" +
        "LOWER(p.nombre)       LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.nif)          LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.direccion)    LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.email)        LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "p.telefono            LIKE CONCAT('%', :search, '%'))")
    Page<Proveedor> searchPagedByTipo(@Param("search") String search, @Param("tipo") TipoProducto tipo, Pageable pageable);

}
