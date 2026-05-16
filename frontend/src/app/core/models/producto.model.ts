import { Proveedor } from './proveedor.model';
import { Receta } from './helado.model';


export type UnidadMedida   = 'KILOGRAMO' | 'GRAMO' | 'LITRO' | 'MILILITRO' | 'UNIDAD' | 'DOCENA';
export type TipoProducto   = 'OBRADOR' | 'TIENDA' | 'AMBOS';
export type EstadoProducto = 'ALMACEN' | 'TIENDA' | 'CONSUMIDO';
export type Envase         = 'BOTE' | 'BOTELLA' | 'SACO' | 'BOLSA' | 'CAJA' | 'UNIDAD';

export interface UnidadMedidaInfo {
  nombre: string;
  abreviatura: string;
}

export const UNIDADES_MEDIDA: Record<UnidadMedida, UnidadMedidaInfo> = {
  KILOGRAMO: { nombre: 'Kilogramo', abreviatura: 'kg'  },
  GRAMO:     { nombre: 'Gramo',     abreviatura: 'g'   },
  LITRO:     { nombre: 'Litro',     abreviatura: 'L'   },
  MILILITRO: { nombre: 'Mililitro', abreviatura: 'ml'  },
  UNIDAD:    { nombre: 'Unidad',    abreviatura: 'ud'  },
  DOCENA:    { nombre: 'Docena',    abreviatura: 'doc' },
};

export interface Producto {
  id: number;
  nombre: string;
  fechaCaducidad?: string;
  precio?: number;
  unidadMedida: UnidadMedida;
  stockActual: number;
  stockMinimo: number;
  tipoProducto?: TipoProducto;
  envase?: Envase;
  contenidoPorUnidad: number;
  proveedor?: Proveedor;
}

export interface IngredienteReceta {
  id:               number;
  receta:           Receta;
  producto?:        Producto;
  subrecetaId?:     number;
  subrecetaNombre?: string;
  subrecetaCoste?:  number;
  cantidad:         number;
  cantidadOriginal?: number | null;
  unidadOriginal?:   UnidadMedida | null;
}
