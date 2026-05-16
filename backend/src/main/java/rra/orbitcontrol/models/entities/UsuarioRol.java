package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import rra.orbitcontrol.models.enums.RolNombre;

import java.time.LocalDateTime;

@Entity
@Table (name = "usuarios_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UsuarioRol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuarios_roles")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    @NotNull(message = "{error.usuario-rol.usuario}")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol")
    @NotNull(message = "{error.usuario-rol.rol}")
    private RolNombre rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asignado_por")
    private Usuario asignadoPor;

    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;
}
