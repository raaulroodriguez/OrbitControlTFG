import {IngredienteReceta} from './producto.model';

export type TipoHelado  = 'BARQUETA' | 'PALETA';
export type EstadoHelado = 'ALMACEN' | 'TIENDA' | 'CONSUMIDO';
export type TipoReceta  = 'HELADO' | 'CASERA';

export interface Helado {
  id: number;
  nombre: string;
  tipo: TipoHelado;
  receta: Receta;
  stockActual: number;
  stockMinimo: number;
  costeProducion: number;
}

export interface HeladoElaborado {
  id: number;
  codigoProducto: string;
  helado: Helado;
  cantidad: number;
  estado: EstadoHelado;
  fechaElaboracion: string;
  fechaCaducidad: string;
}

export interface EventoHelado {
    heladoId:              number;
    nombre:                string;
    tipo:                  TipoHelado;
    cantidad:              number;
    fechaUltimaElaboracion: string;
    stockActual:            number;
}

export interface Receta {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tipoReceta:   TipoReceta;
  tipoHelado?:  TipoHelado;
  stockMinimo?:      number;
  costeElaboracion?: number;
  ingredientes:      IngredienteReceta[];
}
