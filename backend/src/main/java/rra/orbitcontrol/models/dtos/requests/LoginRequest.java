package rra.orbitcontrol.models.dtos.requests;

import lombok.Data;

@Data
public class LoginRequest {
    private String nombreUsuario;
    private String password;
}
