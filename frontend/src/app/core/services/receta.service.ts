import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Receta, TipoReceta } from '../models/helado.model';

export interface RecetaPageResponse {
  recetas:     Receta[];
  currentPage: number;
  totalPages:  number;
  total:       number;
}

@Injectable({
  providedIn: 'root',
})

export class RecetaService {
  private http = inject(HttpClient);
  private readonly API = '/api/recetas';

  getAll(): Observable<Receta[]> {
    return this.http.get<Receta[]>(this.API);
  }

  getById(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.API}/${id}`);
  }

  create(Receta: Receta): Observable<Receta> {
    return this.http.post<Receta>(this.API, Receta);
  }

  update(id: number, Receta: Receta): Observable<Receta> {
    return this.http.put<Receta>(`${this.API}/${id}`, Receta);
  }

  getAllPaged(pagina: number, tamanio: number = 10, sortBy = 'nombre', sortDir = 'asc', search = '', filtro = ''): Observable<RecetaPageResponse> {
    return this.http.get<RecetaPageResponse>(this.API, {
      params: { pagina: pagina.toString(), tamanio: tamanio.toString(), sortBy, sortDir, search, filtro }
    });
  }

  getByTipo(tipo: TipoReceta): Observable<Receta[]> {
    return this.http.get<Receta[]>(`${this.API}/tipo/${tipo}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
