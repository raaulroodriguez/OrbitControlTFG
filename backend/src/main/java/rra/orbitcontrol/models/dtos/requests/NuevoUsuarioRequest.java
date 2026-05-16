package rra.orbitcontrol.models.dtos.requests;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NuevoUsuarioRequest {
    private String nombre;
    private String apellidos;
    private String email;
    private String telefono;
    private String nombreUsuario;
    private String password;
    private List<String> roles;
    private boolean activo = true;
    private String nfcUid;
}
