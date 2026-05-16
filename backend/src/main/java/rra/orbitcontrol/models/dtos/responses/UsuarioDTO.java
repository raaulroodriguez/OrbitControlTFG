package rra.orbitcontrol.models.dtos.responses;

import lombok.Getter;
import lombok.Setter;
import rra.orbitcontrol.models.enums.RolNombre;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UsuarioDTO {

    private Long id;
    private String nombre;
    private String apellidos;
    private String nombreUsuario;
    private String email;
    private String telefono;
    private boolean activo;
    private String nfcUid;
    private LocalDateTime fechaAlta;
    private List<RolDTO> roles;

    @Getter
    @Setter
    public static class RolDTO {
        private Long id;
        private RolNombre rol;
        private LocalDateTime fechaAsignacion;
    }
}
