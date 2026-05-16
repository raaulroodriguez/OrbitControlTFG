import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HeladoService } from './helado.service';
import { Helado } from '../models/helado.model';

describe('HeladoService', () => {
  let service: HeladoService;
  let httpMock: HttpTestingController;

  const heladoMock: Helado = {
    id: 1,
    nombre: 'Vainilla',
    tipo: 'BARQUETA',
    receta: { id: 1, nombre: 'Receta Vainilla', descripcion: '', activo: true, ingredientes: [] },
    stockActual: 10,
    stockMinimo: 5,
    costeProduccion: 2.5
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HeladoService]
    });
    service = TestBed.inject(HeladoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll hace GET a /api/helados', () => {
    service.getAll().subscribe(helados => {
      expect(helados.length).toBe(1);
      expect(helados[0].nombre).toBe('Vainilla');
    });

    const req = httpMock.expectOne('/api/helados');
    expect(req.request.method).toBe('GET');
    req.flush([heladoMock]);
  });

  it('getById hace GET a /api/helados/:id', () => {
    service.getById(1).subscribe(h => expect(h.id).toBe(1));

    const req = httpMock.expectOne('/api/helados/1');
    expect(req.request.method).toBe('GET');
    req.flush(heladoMock);
  });

  it('getStockBajo hace GET a /api/helados/alertas/stockBajo', () => {
    service.getStockBajo().subscribe(helados => expect(helados).toEqual([heladoMock]));

    const req = httpMock.expectOne('/api/helados/alertas/stockBajo');
    expect(req.request.method).toBe('GET');
    req.flush([heladoMock]);
  });

  it('create hace POST a /api/helados', () => {
    service.create(heladoMock).subscribe(h => expect(h.nombre).toBe('Vainilla'));

    const req = httpMock.expectOne('/api/helados');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(heladoMock);
    req.flush(heladoMock);
  });

  it('update hace PUT a /api/helados/:id', () => {
    service.update(1, heladoMock).subscribe(h => expect(h.id).toBe(1));

    const req = httpMock.expectOne('/api/helados/1');
    expect(req.request.method).toBe('PUT');
    req.flush(heladoMock);
  });

  it('delete hace DELETE a /api/helados/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/helados/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
