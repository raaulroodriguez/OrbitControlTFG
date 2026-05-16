package rra.orbitcontrol.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import rra.orbitcontrol.models.entities.Receta;
import rra.orbitcontrol.models.enums.TipoHelado;
import rra.orbitcontrol.models.enums.TipoReceta;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {

    @Query("SELECT r FROM Receta r " +
           "LEFT JOIN FETCH r.ingredientes i " +
           "LEFT JOIN FETCH i.producto p " +
           "LEFT JOIN FETCH p.proveedor " +
           "WHERE r.id = :id")
    Optional<Receta> findByIdWithAll(@Param("id") Long id);

    List<Receta> findByTipoReceta(TipoReceta tipoReceta);

    @Query("SELECT DISTINCT r FROM Receta r " +
        "LEFT JOIN r.ingredientes ing " +
        "LEFT JOIN ing.producto p " +
        "WHERE LOWER(r.nombre)                        LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(r.descripcion)                   LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(CAST(r.tipoHelado AS string))    LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(p.nombre)                        LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Receta> searchPaged(@Param("search") String search, Pageable pageable);

    Page<Receta> findByTipoReceta(TipoReceta tipoReceta, Pageable pageable);

    Page<Receta> findByTipoHelado(TipoHelado tipoHelado, Pageable pageable);

    @Query("SELECT DISTINCT r FROM Receta r " +
        "LEFT JOIN r.ingredientes ing " +
        "LEFT JOIN ing.producto p " +
        "WHERE r.tipoReceta = :tipo AND (" +
        "      LOWER(r.nombre)                        LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(r.descripcion)                   LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(CAST(r.tipoHelado AS string))    LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(p.nombre)                        LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Receta> searchPagedByTipoReceta(@Param("search") String search, @Param("tipo") TipoReceta tipo, Pageable pageable);

    @Query("SELECT DISTINCT r FROM Receta r " +
        "LEFT JOIN r.ingredientes ing " +
        "LEFT JOIN ing.producto p " +
        "WHERE r.tipoHelado = :tipo AND (" +
        "      LOWER(r.nombre)                        LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(r.descripcion)                   LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "      LOWER(p.nombre)                        LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Receta> searchPagedByTipoHelado(@Param("search") String search, @Param("tipo") TipoHelado tipo, Pageable pageable);
}
