export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface EventoAlmacen {
    id:              number;
    productoId:      number;
    productoNombre:  string;
    tipo:            TipoMovimiento;
    cantidad:        number;
    motivo:          string;
    fecha:           string;
}

export interface EventoAlmacenRequest {
    productoId: number;
    tipo:       TipoMovimiento;
    cantidad:   number;
    motivo:     string;
}

export interface EventoAlmacenPage {
    movimientos: EventoAlmacen[];
    currentPage: number;
    totalPages:  number;
    total:       number;
}
