package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import lombok.*;
import rra.orbitcontrol.models.enums.Plataforma;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispositivo_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class DispositivoToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 512)
    private String token;

    @Enumerated(EnumType.STRING)
    private Plataforma plataforma;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();
}
