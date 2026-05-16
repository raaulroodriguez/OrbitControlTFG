package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import rra.orbitcontrol.models.enums.TipoProducto;

@Entity
@Table(name = "proveedores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "{error.proveedor.nombre}")
    @Size(max = 100, message = "{error.proveedor.nombre.size.max}")
    private String nombre;

    @NotBlank(message = "{error.proveedor.nif}")
    @Size(max = 9, min = 9, message = "{error.proveedor.nif.size}")
    @Column(unique = true, nullable = false)
    private String nif;

    @Size(max = 20, message = "{error.proveedor.telefono.size.max}")
    @Column(unique = true)
    private String telefono;

    @Email(message = "{error.correo.formato}")
    @Size(max = 100, message = "{error.proveedor.email.size.max}")
    @Column(unique = true)
    private String email;

    @Size(max = 255, message = "{error.proveedor.direccion.size.max}")
    private String direccion;

    @Enumerated(EnumType.STRING)
    private TipoProducto tipoProducto;

    @Builder.Default
    private boolean activo = true;
}
