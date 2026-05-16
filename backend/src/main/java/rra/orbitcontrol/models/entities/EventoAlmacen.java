package rra.orbitcontrol.models.entities;

import jakarta.persistence.*;
import lombok.*;
import rra.orbitcontrol.models.enums.TipoEventoAlmacen;

import java.time.LocalDateTime;

@Entity
@Table(name = "eventos_almacen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoAlmacen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @Enumerated(EnumType.STRING)
    private TipoEventoAlmacen tipo;

    private double   cantidad;
    private String   motivo;
    private LocalDateTime fecha;
}
