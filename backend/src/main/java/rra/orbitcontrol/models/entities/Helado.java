package rra.orbitcontrol.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import rra.orbitcontrol.models.enums.TipoHelado;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "helados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Helado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_helado")
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "{error.helado.nombre}")
    @Size(max = 100, message = "{error.helado.nombre.size.max}")
    private String nombre;

    @Enumerated(EnumType.STRING)
    private TipoHelado tipo;

    @ManyToOne
    @JoinColumn(name = "id_receta")
    private Receta receta;

    @Min(value = 0, message = "{error.helado.stockactual.min}")
    private Integer stockActual;

    @Min(value = 0, message = "{error.helado.stockminimo.min}")
    private Integer stockMinimo;

    @Min(value = 0, message = "{error.helado.coste.min}")
    private double costeProducion;

    @Builder.Default
    private boolean activo = true;

    @OneToMany(mappedBy = "helado", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JsonIgnore
    @Builder.Default
    private List<HeladoElaborado> heladosElaborados = new ArrayList<>();
}
