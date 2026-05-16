import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlantillaPedido } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PlantillaPedidoService {
  private http = inject(HttpClient);
  private readonly API = '/api/plantillas-pedido';

  getAll(): Observable<PlantillaPedido[]> {
    return this.http.get<PlantillaPedido[]>(this.API);
  }

  create(req: any): Observable<PlantillaPedido> {
    return this.http.post<PlantillaPedido>(this.API, req);
  }

  update(id: number, req: any): Observable<PlantillaPedido> {
    return this.http.put<PlantillaPedido>(`${this.API}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
