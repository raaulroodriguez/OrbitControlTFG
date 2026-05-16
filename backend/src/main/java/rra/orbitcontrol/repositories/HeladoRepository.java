package rra.orbitcontrol.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rra.orbitcontrol.models.entities.Helado;
import rra.orbitcontrol.models.enums.TipoHelado;
import java.util.List;
import java.util.Optional;

@Repository
public interface HeladoRepository extends JpaRepository<Helado, Long> {

    Optional<Helado> findByNombre(String nombre);

    List<Helado> findByTipo(TipoHelado tipo);

    @Query("SELECT h from Helado h WHERE h.costeProducion > :precioAlto")
    List<Helado> findHeladosCosteMayorA(@Param("precioAlto") double precioAlto);

    @Query(value = "SELECT h FROM Helado h WHERE h.stockActual <= h.stockMinimo",
            countQuery = "SELECT COUNT(h) FROM Helado h WHERE h.stockActual <= h.stockMinimo")
    Page<Helado> findStockBajo(Pageable pageable);

    Optional<Helado> findByRecetaId(Long recetaId);

    @Query("SELECT h FROM Helado h LEFT JOIN h.receta r WHERE " +
        "LOWER(h.nombre)              LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(CAST(h.tipo AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(r.nombre)              LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Helado> searchPaged(@Param("search") String search, Pageable pageable);

    @Query("SELECT h FROM Helado h WHERE h.tipo = :tipo")
    Page<Helado> searchByTipoPaged(@Param("tipo") TipoHelado tipo, Pageable pageable);

    @Query("SELECT h FROM Helado h LEFT JOIN h.receta r WHERE h.tipo = :tipo AND (" +
        "LOWER(h.nombre)              LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(CAST(h.tipo AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(r.nombre)              LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Helado> searchPagedByTipo(@Param("search") String search, @Param("tipo") TipoHelado tipo, Pageable pageable);
}
