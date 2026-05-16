package rra.orbitcontrol.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import rra.orbitcontrol.models.entities.Producto;

import java.util.List;
import java.util.Optional;
import rra.orbitcontrol.models.enums.TipoProducto;


@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.proveedor")
    List<Producto> findAllWithProveedor();

    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.proveedor WHERE p.id = :id")
    Optional<Producto> findByIdWithProveedor(@Param("id") Long id);

    @Query(value = "SELECT p FROM Producto p LEFT JOIN FETCH p.proveedor WHERE p.stockActual <= p.stockMinimo",
        countQuery = "SELECT COUNT(p) FROM Producto p WHERE p.stockActual <= p.stockMinimo")
    Page<Producto> findStockBajo(Pageable pageable);

    List<Producto> findByTipoProducto(TipoProducto tipoProducto);

    Page<Producto> findByTipoProducto(TipoProducto tipoProducto, Pageable pageable);

    @Query("SELECT p FROM Producto p LEFT JOIN p.proveedor prov WHERE " +
        "p.tipoProducto = :tipo AND (" +
        "LOWER(p.nombre)                       LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(CAST(p.unidadMedida AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.envase)                       LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(prov.nombre)                    LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Producto> searchPagedByTipo(@Param("search") String search, @Param("tipo") TipoProducto tipo, Pageable pageable);

    boolean existsByNombre(String nombre);

    @Query("SELECT p FROM Producto p LEFT JOIN p.proveedor prov WHERE " +
        "LOWER(p.nombre)                       LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(CAST(p.unidadMedida AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(CAST(p.tipoProducto AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(p.envase)                       LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(prov.nombre)                    LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Producto> searchPaged(@Param("search") String search, Pageable pageable);
}
