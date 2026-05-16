import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    EventoAlmacen,
    EventoAlmacenPage,
    EventoAlmacenRequest
} from '../models/evento-almacen.model';

@Injectable({ providedIn: 'root' })
export class EventoAlmacenService {
    private http = inject(HttpClient);
    private readonly API = '/api/almacen/movimientos';

    getAllPaged(pagina: number = 0, tamanio: number = 20): Observable<EventoAlmacenPage> {
        return this.http.get<EventoAlmacenPage>(this.API, {
            params: { pagina: pagina.toString(), tamanio: tamanio.toString() }
        });
    }

    byProducto(productoId: number): Observable<EventoAlmacen[]> {
        return this.http.get<EventoAlmacen[]>(`${this.API}/producto/${productoId}`);
    }

    registrar(req: EventoAlmacenRequest): Observable<EventoAlmacen> {
        return this.http.post<EventoAlmacen>(this.API, req);
    }
}
