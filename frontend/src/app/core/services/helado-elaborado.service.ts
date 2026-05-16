import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeladoElaborado, EventoHelado } from '../models/helado.model';

@Injectable({
  providedIn: 'root',
})
export class HeladoElaboradoService {
  private http = inject(HttpClient);
  private readonly API = '/api/helados/inventario';

  getAll(): Observable<HeladoElaborado[]> {
    return this.http.get<HeladoElaborado[]>(this.API);
  }

  getById(id: number): Observable<HeladoElaborado> {
    return this.http.get<HeladoElaborado>(`${this.API}/${id}`);
  }

  getRecientes(): Observable<HeladoElaborado[]> {
    return this.http.get<HeladoElaborado[]>(`${this.API}/recientes`);
  }

  getRecientesAgrupados(): Observable<EventoHelado[]> {
    return this.http.get<EventoHelado[]>(`${this.API}/recientes-agrupados`);
  }

  getConsumidos(): Observable<HeladoElaborado[]> {
    return this.http.get<HeladoElaborado[]>(`${this.API}/consumidos`);
  }

  getConsumidosAgrupados(): Observable<EventoHelado[]> {
    return this.http.get<EventoHelado[]>(`${this.API}/consumidos-agrupados`);
  }

  create(heladoElaborado: HeladoElaborado): Observable<HeladoElaborado> {
    return this.http.post<HeladoElaborado>(this.API, heladoElaborado);
  }

  update(id: number, heladoElaborado: HeladoElaborado): Observable<HeladoElaborado> {
    return this.http.put<HeladoElaborado>(`${this.API}/${id}`, heladoElaborado);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
