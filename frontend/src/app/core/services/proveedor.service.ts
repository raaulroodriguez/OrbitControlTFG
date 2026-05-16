import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../models/proveedor.model';

export interface ProveedorPageResponse {
  proveedores: Proveedor[];
  currentPage: number;
  totalPages: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})

export class ProveedorService {
  private http = inject(HttpClient);
  private readonly API = '/api/proveedores';

  getAll(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.API);
  }

  getAllPaged(pagina: number, tamanio: number = 10, sortBy = 'nombre', sortDir = 'asc', search = '', filtro = ''): Observable<ProveedorPageResponse> {
    return this.http.get<ProveedorPageResponse>(this.API, {
      params: { pagina: pagina.toString(), tamanio: tamanio.toString(), sortBy, sortDir, search, filtro }
    });
  }

  getById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.API}/${id}`);
  }

  getTipoProductos(): Observable<String[]> {
    return this.http.get<String[]>(`${this.API}/tipoProductos`);
  }

  create(Proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.API, Proveedor);
  }

  update(id: number, Proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.API}/${id}`, Proveedor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
