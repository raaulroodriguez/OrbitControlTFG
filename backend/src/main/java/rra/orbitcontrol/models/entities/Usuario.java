package rra.orbitcontrol.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "{error.nombre}")
    @Size(max = 100, message = "{error.nombre.size.max}")
    private String nombre;

    @NotBlank(message = "{error.apellidos}")
    @Size(max = 100, message = "{error.apellidos.size.max}")
    private String apellidos;

    @NotBlank(message = "{error.nombreUsuario")
    @Size(max = 100, message = "{error.nombreUsuario.size.max")
    @Column(unique = true)
    private String nombreUsuario;

    @NotBlank(message = "{error.password}")
    @Size(min = 4, max = 255, message = "{error.password.size.min}")
    @JsonIgnore
    private String password;

    @Column(unique = true)
    private String nfcUid;

    @Column(unique = true)
    private String dni;

    @NotBlank(message = "{error.email}")
    @Email(message = "{error.correo.formato}")
    @Size(max = 100, message = "{error.email.size.max}")
    @Column(unique = true)
    private String email;

    @Size(max = 20, message = "{error.telefono.size.max}")
    @Column(unique = true)
    private String telefono;

    private LocalDateTime fechaAlta;

    @Builder.Default
    private boolean activo = true;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<UsuarioRol> roles = new ArrayList<>();

}
