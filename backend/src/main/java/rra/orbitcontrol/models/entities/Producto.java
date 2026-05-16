package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import rra.orbitcontrol.models.enums.Envase;
import rra.orbitcontrol.models.enums.TipoProducto;
import rra.orbitcontrol.models.enums.UnidadMedida;

import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "{error.ingrediente-obrador.nombre}")
    @Size(max = 100, message = "{error.ingrediente-obrador.nombre.size.max}")
    private String nombre;

    private LocalDateTime fechaCaducidad;

    @Min(value = 0, message = "{error.ingrediente-obrador.precio.min}")
    private double precio;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "{error.ingrediente-obrador.unidadmedida}")
    private UnidadMedida unidadMedida;

    @Min(value = 0, message = "{error.ingrediente-obrador.cantidad.min}")
    private double stockActual;

    @Min(value = 0, message = "{error.ingrediente-obrador.stockminimo.min}")
    private double stockMinimo;

    @Enumerated(EnumType.STRING)
    private TipoProducto tipoProducto;

    @Enumerated(EnumType.STRING)
    private Envase envase;

    private double contenidoPorUnidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor")
    private Proveedor proveedor;
}
