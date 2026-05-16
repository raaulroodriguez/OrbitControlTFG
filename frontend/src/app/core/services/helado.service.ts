import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Helado } from '../models/helado.model';

export interface HeladoPageResponse {
  helados: Helado[];
  currentPage: number;
  totalPages: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})

export class HeladoService {
  private http = inject(HttpClient);
  private readonly API = '/api/helados';

  getAll(): Observable<Helado[]> {
    return this.http.get<Helado[]>(this.API);
  }

  getAllPaged(pagina: number, tamanio: number = 10, sortBy = 'nombre', sortDir = 'asc', search = '', filtro = ''): Observable<HeladoPageResponse> {
    return this.http.get<HeladoPageResponse>(this.API, {
      params: { pagina: pagina.toString(), tamanio: tamanio.toString(), sortBy, sortDir, search, filtro }
    });
  }

  getById(id: number): Observable<Helado> {
    return this.http.get<Helado>(`${this.API}/${id}`);
  }

  getStockBajo(pagina: number = 0, tamanio: number = 5): Observable<Helado[]> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());

    return this.http.get<HeladoPageResponse>(`${this.API}/alertas/stockBajo`, { params })
      .pipe(
        map(response => response.helados)
      );
  }

  create(Helado: Helado): Observable<Helado> {
    return this.http.post<Helado>(this.API, Helado);
  }

  update(id: number, Helado: Helado): Observable<Helado> {
    return this.http.put<Helado>(`${this.API}/${id}`, Helado);
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
