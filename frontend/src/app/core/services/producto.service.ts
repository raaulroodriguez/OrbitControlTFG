import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Producto, TipoProducto } from '../models/producto.model';

export interface PageResponse<T> {
  productos: T[];
  currentPage: number;
  totalPages: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})

export class ProductoService {
  private http = inject(HttpClient);
  private readonly API = '/api/productos';

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.API);
  }

  getAllPaged(pagina: number, tamanio: number = 10, sortBy = 'nombre', sortDir = 'asc', search = '', filtro = ''): Observable<PageResponse<Producto>> {
    return this.http.get<PageResponse<Producto>>(this.API, {
      params: { pagina: pagina.toString(), tamanio: tamanio.toString(), sortBy, sortDir, search, filtro }
    });
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API}/${id}`);
  }

  getStockBajo(pagina: number = 0, tamanio: number = 5): Observable<Producto[]> {
      return this.http.get<PageResponse<Producto>>(`${this.API}/alertas/stockBajo`, {
          params: { pagina: pagina.toString(), tamanio: tamanio.toString() }
      }).pipe(
          map(response => response.productos)
      );
  }

  getByTipo(tipoProducto: TipoProducto): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.API}/tipoProducto/${tipoProducto}`);
  }

  create(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.API, producto);
  }

  update(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.API}/${id}`, producto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  enviarAlerta(id: number): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/alerta`, {});
  }

  enviarTodasAlertas(): Observable<void> {
    return this.http.post<void>(`${this.API}/alertas/enviar`, {});
  }
}
