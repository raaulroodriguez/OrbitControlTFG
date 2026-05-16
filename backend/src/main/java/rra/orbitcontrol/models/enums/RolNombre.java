package rra.orbitcontrol.models.enums;

import lombok.Getter;

@Getter
public enum RolNombre {
    ADMIN(1, "Administrador del sistema"),
    ENCARGADO(2, "Encargado de tienda/obrador"),
    HELADERO(3, "Personal de producción"),
    DEPENDIENTE(3, "Personal de ventas");

    private final int nivel;
    private final String descripcion;

    RolNombre(int nivel, String descripcion) {
        this.nivel = nivel;
        this.descripcion = descripcion;
    }
}
