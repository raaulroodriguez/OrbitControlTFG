package rra.orbitcontrol.exceptions;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class ApiError {

    private int status;
    private String mensaje;
    private LocalDateTime timestamp;
    private Map<String, String> errors;

    public ApiError(int status, String mensaje) {
        this.status = status;
        this.mensaje = mensaje;
        this.timestamp = LocalDateTime.now();
    }
}
