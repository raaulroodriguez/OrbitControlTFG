export type RolNombre = 'ADMIN' | 'ENCARGADO' | 'HELADERO' | 'DEPENDIENTE';

export interface UsuarioRol {
  id: number;
  rol: RolNombre;
  fechaAsignacion: string;
}

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  activo: boolean;
  nfcUid?: string;
  roles: UsuarioRol[];
  fechaCreacion?: string;
  fechaUltimaActualizacion?: string;
}

export interface LoginRequest {
  nombreUsuario: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}
