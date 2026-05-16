package rra.orbitcontrol.exceptions;

public class EntityNotFoundException extends RuntimeException {

    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String entidad, Long id) {
        super("No existe " + entidad + " con id: " + id);
    }
}
