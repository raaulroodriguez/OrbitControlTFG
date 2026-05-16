package rra.orbitcontrol.models.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import rra.orbitcontrol.models.enums.EstadoPedido;
import rra.orbitcontrol.models.enums.TipoProducto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    @EqualsAndHashCode.Include
    private Long id;

    @Size(max = 50, message = "{error.pedido.codigo.size.max}")
    @Column(unique = true)
    private String codigoPedido;

    @ManyToOne
    @JoinColumn(name = "id_proveedor")
    @NotNull(message = "{error.pedido.proveedor}")
    private Proveedor proveedor;

    @Enumerated(EnumType.STRING)
    private TipoProducto tipoProductoPedido;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaPedido;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaEntrega;

    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_solicitante")
    @NotNull(message = "{error.pedido.solicitante}")
    @JsonIgnore
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recibido_por")
    @JsonIgnore
    private Usuario recibidoPor;

    private LocalDateTime fechaRecibido;

    @Size(max = 500, message = "{error.pedido.observaciones.size.max}")
    private String observaciones;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<ProductoPedido> items = new ArrayList<>();
}
