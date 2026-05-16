package rra.orbitcontrol.models.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioSelectorDTO {
    private Long id;
    private String nombre;
    private String apellidos;
    private String nombreUsuario;
    private List<String> roles;
}
