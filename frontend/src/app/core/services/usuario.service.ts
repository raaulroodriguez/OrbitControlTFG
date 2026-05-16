import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, RolNombre } from '../models/usuario.model';

export interface UsuarioPageResponse {
  usuarios: Usuario[];
  currentPage: number;
  totalPages: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly API = '/api/usuarios';

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API);
  }

  getAllPaged(pagina: number, tamanio: number = 10, sortBy = 'nombre', sortDir = 'asc', search = '', filtro = ''): Observable<UsuarioPageResponse> {
    return this.http.get<UsuarioPageResponse>(this.API, {
      params: { pagina: pagina.toString(), tamanio: tamanio.toString(), sortBy, sortDir, search, filtro }
    });
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API}/${id}`);
  }

  getRolesDisponibles(): Observable<RolNombre[]> {
    return this.http.get<RolNombre[]>(`${this.API}/roles`);
  }

  create(usuario: Partial<Usuario> & { password?: string }): Observable<Usuario> {
    return this.http.post<Usuario>(this.API, usuario);
  }

  update(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API}/${id}`, usuario);
  }

  putNFC(id: number, nfcUid: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API}/${id}/nfc`, { nfcUid });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  deleteNFC(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}/nfc`);
  }

  comprobarUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API}/comprobarusername/${username}`);
  }
}