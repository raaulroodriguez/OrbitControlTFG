import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoPedido, Pedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root',
})

export class PedidoService {
  private http = inject(HttpClient);
  private readonly API = '/api/pedidos';

  getAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.API);
  }

  getById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.API}/${id}`);
  }

  create(pedido: any): Observable<Pedido> {
    return this.http.post<Pedido>(this.API, pedido);
  }

  update(id: number, pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.API}/${id}`, pedido);
  }

  cambiarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.API}/${id}/estado`, { estado });
  }

  guardarBorrador(pedido: any): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.API}/borrador`, pedido);
  }

  getBorradores(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API}/borradores`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
