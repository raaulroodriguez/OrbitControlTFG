import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lote, TipoEntidadLote } from '../models/lote.model';

@Injectable({
  providedIn: 'root',
})
export class LoteService {
  private http = inject(HttpClient);
  private readonly API = '/api/lotes';

  getAll(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.API);
  }

  getById(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.API}/${id}`);
  }

  getByEntidad(tipoEntidad: TipoEntidadLote, entidadId: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.API}/entidad/${tipoEntidad}/${entidadId}`);
  }

  getByPedido(pedidoId: number): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.API}/pedido/${pedidoId}`);
  }

  getProximosCaducar(dias: number = 30): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${this.API}/proximos-caducar`, {
      params: { dias: dias.toString() }
    });
  }

  create(lote: Lote): Observable<Lote> {
    return this.http.post<Lote>(this.API, lote);
  }

  update(id: number, lote: Lote): Observable<Lote> {
    return this.http.put<Lote>(`${this.API}/${id}`, lote);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
