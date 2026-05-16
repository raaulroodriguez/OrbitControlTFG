package rra.orbitcontrol.exceptions;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String nombreProducto, double necesario, double disponible, String unidad) {
        super("Stock insuficiente de '" + nombreProducto + "': necesario "
                + necesario + " " + unidad + ", disponible " + disponible);
    }

    public InsufficientStockException(String entidad, int necesario, int disponible) {
        super("Stock insuficiente de " + entidad + ": necesario " + necesario + ", disponible " + disponible);
    }
}
