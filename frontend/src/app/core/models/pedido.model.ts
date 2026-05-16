import { Proveedor } from './proveedor.model';

export type EstadoPedido = 'BORRADOR' | 'PENDIENTE' | 'RECIBIDO' | 'PAGADO' | 'CANCELADO';

export interface ProductoPedido {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidadSolicitada: number;
  precio: number;
  envase?: string;
  contenidoPorUnidad?: number;
  unidadMedida?: string;
}

export interface Pedido {
  id: number;
  codigoPedido?: string;
  proveedor: Proveedor;
  estado: EstadoPedido;
  tipoProductoPedido?: string;
  fechaPedido: string;
  fechaEntrega?: string;
  fechaRecibido?: string;
  observaciones?: string;
  items: ProductoPedido[];
}

export interface ItemPlantillaPedido {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidadSolicitada: number;
  precio: number;
}

export interface PlantillaPedido {
  id: number;
  nombre: string;
  descripcion?: string;
  proveedor: Proveedor;
  observaciones?: string;
  activo: boolean;
  items: ItemPlantillaPedido[];
}
