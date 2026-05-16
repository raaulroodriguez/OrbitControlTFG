export type TipoEntidadLote = 'PRODUCTO' | 'HELADO';

export interface Lote {
  id?: number;
  tipoEntidad: TipoEntidadLote;
  entidadId: number;
  cantidad: number;
  fechaCaducidad?: string;
  fechaEntrada?: string;
  pedidoId?: number;
  observaciones?: string;
}
