export type TipoProducto = 'OBRADOR' | 'TIENDA' | 'AMBOS';

export interface Proveedor {
  id: number;
  nombre: string;
  nif: string;
  telefono: string;
  email: string;
  direccion: string;
  tipoProducto: TipoProducto;
  activo: boolean;
}
