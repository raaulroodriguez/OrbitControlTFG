package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.*;
import rra.orbitcontrol.models.enums.UnidadMedida;

@Entity
@Table(name = "ingredientes_receta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class IngredienteReceta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_receta")
    private Receta receta;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_subreceta")
    private Receta subreceta;

    /** Cantidad convertida a la unidad base del producto (kg, L, ud) */
    @Positive(message = "{error.ingrediente-receta.cantidad.positive}")
    private double cantidad;

    /** Cantidad tal como la escribió el usuario (ej: 350) — nullable para filas anteriores */
    private Double cantidadOriginal;

    /** Unidad que usó el usuario (ej: GRAMO) */
    @Enumerated(EnumType.STRING)
    private UnidadMedida unidadOriginal;
}
