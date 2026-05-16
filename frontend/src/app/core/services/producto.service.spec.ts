import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductoService } from './producto.service';
import { Producto } from '../models/producto.model';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  const productoMock: Producto = {
    id: 1,
    nombre: 'Leche',
    descripcion: 'Leche entera',
    tipo: 'OBRADOR',
    unidad: 'L',
    stockActual: 20,
    stockMinimo: 5,
    precio: 1.2,
    activo: true,
    proveedor: { id: 1, nombre: 'Proveedor A', activo: true }
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductoService]
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll hace GET a /api/productos', () => {
    service.getAll().subscribe(productos => {
      expect(productos.length).toBe(1);
      expect(productos[0].nombre).toBe('Leche');
    });

    const req = httpMock.expectOne('/api/productos');
    expect(req.request.method).toBe('GET');
    req.flush([productoMock]);
  });

  it('getById hace GET a /api/productos/:id', () => {
    service.getById(1).subscribe(p => expect(p.id).toBe(1));

    const req = httpMock.expectOne('/api/productos/1');
    expect(req.request.method).toBe('GET');
    req.flush(productoMock);
  });

  it('getStockBajo hace GET a /api/productos/alertas/stockBajo', () => {
    service.getStockBajo().subscribe(productos => expect(productos).toEqual([productoMock]));

    const req = httpMock.expectOne('/api/productos/alertas/stockBajo');
    expect(req.request.method).toBe('GET');
    req.flush([productoMock]);
  });

  it('create hace POST a /api/productos', () => {
    service.create(productoMock).subscribe(p => expect(p.nombre).toBe('Leche'));

    const req = httpMock.expectOne('/api/productos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(productoMock);
    req.flush(productoMock);
  });

  it('update hace PUT a /api/productos/:id', () => {
    service.update(1, productoMock).subscribe(p => expect(p.id).toBe(1));

    const req = httpMock.expectOne('/api/productos/1');
    expect(req.request.method).toBe('PUT');
    req.flush(productoMock);
  });

  it('delete hace DELETE a /api/productos/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/productos/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
