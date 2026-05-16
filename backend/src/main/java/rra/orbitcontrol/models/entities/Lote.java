package rra.orbitcontrol.models.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import rra.orbitcontrol.models.enums.TipoEntidadLote;

import java.time.LocalDateTime;

@Entity
@Table(name = "lotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    @EqualsAndHashCode.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "{error.lote.tipoEntidad}")
    private TipoEntidadLote tipoEntidad;

    @NotNull(message = "{error.lote.entidadId}")
    private Long entidadId;

    @Min(value = 0, message = "{error.lote.cantidad.min}")
    private double cantidad;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaCaducidad;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaEntrada;

    private Long pedidoId;

    private String observaciones;
}
