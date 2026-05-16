package rra.orbitcontrol.utils;

import rra.orbitcontrol.models.enums.UnidadMedida;

public class ConversionUtils {

    private ConversionUtils() {}

    /**
     * Convierte una cantidad desde una unidad origen hasta una unidad destino.
     * Solo se permiten conversiones dentro del mismo grupo (masa, volumen, cantidad).
     */
    public static double convertir(double cantidad, UnidadMedida desde, UnidadMedida hasta) {
        if (desde == hasta) return cantidad;
        validarCompatibilidad(desde, hasta);
        return fromBase(toBase(cantidad, desde), hasta);
    }

    /** Convierte a la unidad base del grupo (kg, L, ud) */
    private static double toBase(double cantidad, UnidadMedida unidad) {
        return switch (unidad) {
            case GRAMO     -> cantidad / 1000.0;
            case KILOGRAMO -> cantidad;
            case MILILITRO -> cantidad / 1000.0;
            case LITRO     -> cantidad;
            case UNIDAD    -> cantidad;
            case DOCENA    -> cantidad * 12.0;
        };
    }

    /** Convierte desde la unidad base del grupo hacia la unidad destino */
    private static double fromBase(double cantidad, UnidadMedida unidad) {
        return switch (unidad) {
            case GRAMO     -> cantidad * 1000.0;
            case KILOGRAMO -> cantidad;
            case MILILITRO -> cantidad * 1000.0;
            case LITRO     -> cantidad;
            case UNIDAD    -> cantidad;
            case DOCENA    -> cantidad / 12.0;
        };
    }

    private static void validarCompatibilidad(UnidadMedida desde, UnidadMedida hasta) {
        if (grupoMasa(desde) != grupoMasa(hasta) ||
            grupoVolumen(desde) != grupoVolumen(hasta)) {
            throw new IllegalArgumentException(
                "No se puede convertir entre unidades incompatibles: " + desde + " → " + hasta
            );
        }
    }

    private static boolean grupoMasa(UnidadMedida u) {
        return u == UnidadMedida.GRAMO || u == UnidadMedida.KILOGRAMO;
    }

    private static boolean grupoVolumen(UnidadMedida u) {
        return u == UnidadMedida.MILILITRO || u == UnidadMedida.LITRO;
    }
}
