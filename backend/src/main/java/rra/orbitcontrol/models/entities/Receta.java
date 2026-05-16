package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import rra.orbitcontrol.models.enums.TipoHelado;
import rra.orbitcontrol.models.enums.TipoReceta;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recetas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receta")
    @EqualsAndHashCode.Include
    private Long id;

    @Size(max = 100, message = "{error.receta.nombre.size.max}")
    private String nombre;

    @Size(max = 500, message = "{error.receta.descripcion.size.max}")
    private String descripcion;

    @Builder.Default
    private boolean activo = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_receta", columnDefinition = "VARCHAR(50) DEFAULT 'HELADO'")
    @Builder.Default
    private TipoReceta tipoReceta = TipoReceta.HELADO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_helado")
    private TipoHelado tipoHelado;

    @OneToMany(mappedBy = "receta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IngredienteReceta> ingredientes = new ArrayList<>();

    @Column(name = "coste_elaboracion")
    @Builder.Default
    private Double costeElaboracion = 0.0;

    @Transient
    private Integer stockMinimo;
}
