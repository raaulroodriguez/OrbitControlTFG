package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import rra.orbitcontrol.models.enums.EstadoProducto;

import java.time.LocalDateTime;

@Entity
@Table(name = "helados_elaborados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class HeladoElaborado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_helado_elaborado")
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_helado")
    @NotNull(message = "{error.producto-elaborado.helado}")
    private Helado helado;

    @Size(max = 50, message = "{error.producto-elaborado.codigo.size.max}")
    @Column(unique = true, nullable = false)
    private String codigoProd;

    private LocalDateTime fechaElaboracion;

    private LocalDateTime fechaCaducidad;

    @Enumerated(EnumType.STRING)
    private EstadoProducto estado;

    @PrePersist
    protected void onCreate() {
        if (this.fechaElaboracion == null) {
            this.fechaElaboracion = LocalDateTime.now();
        }
        
        if (this.fechaCaducidad == null) {
            this.fechaCaducidad = this.fechaElaboracion.plusMonths(6);
        }
    }
}
