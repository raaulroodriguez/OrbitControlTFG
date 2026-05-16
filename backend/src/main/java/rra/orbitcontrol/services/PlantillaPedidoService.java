package rra.orbitcontrol.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.PlantillaPedidoMapper;
import rra.orbitcontrol.models.dtos.requests.ItemPlantillaPedidoRequest;
import rra.orbitcontrol.models.dtos.requests.PlantillaPedidoRequest;
import rra.orbitcontrol.models.dtos.responses.PlantillaPedidoDTO;
import rra.orbitcontrol.models.entities.ItemPlantillaPedido;
import rra.orbitcontrol.models.entities.PlantillaPedido;
import rra.orbitcontrol.models.entities.Producto;
import rra.orbitcontrol.models.entities.Proveedor;
import rra.orbitcontrol.repositories.PlantillaPedidoRepository;
import rra.orbitcontrol.repositories.ProductoRepository;
import rra.orbitcontrol.repositories.ProveedorRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlantillaPedidoService {

    private final PlantillaPedidoRepository repo;
    private final PlantillaPedidoMapper     mapper;
    private final ProveedorRepository       proveedorRepository;
    private final ProductoRepository        productoRepository;

    public List<PlantillaPedidoDTO> all() {
        return mapper.toDtoList(repo.findByActivoTrue());
    }

    public PlantillaPedidoDTO one(Long id) {
        return mapper.toDto(repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PlantillaPedido", id)));
    }

    @Transactional
    public PlantillaPedidoDTO crear(PlantillaPedidoRequest req) {
        PlantillaPedido p = new PlantillaPedido();
        p.setNombre(req.getNombre());
        p.setDescripcion(req.getDescripcion());
        p.setObservaciones(req.getObservaciones());
        p.setActivo(true);
        if (req.getProveedorId() != null) {
            Proveedor prov = proveedorRepository.findById(req.getProveedorId())
                    .orElseThrow(() -> new EntityNotFoundException("Proveedor", req.getProveedorId()));
            p.setProveedor(prov);
        }
        p.setItems(buildItems(p, req.getItems()));
        return mapper.toDto(repo.save(p));
    }

    @Transactional
    public PlantillaPedidoDTO actualizar(Long id, PlantillaPedidoRequest req) {
        PlantillaPedido p = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PlantillaPedido", id));
        p.setNombre(req.getNombre());
        p.setDescripcion(req.getDescripcion());
        p.setObservaciones(req.getObservaciones());
        if (req.getProveedorId() != null) {
            Proveedor prov = proveedorRepository.findById(req.getProveedorId())
                    .orElseThrow(() -> new EntityNotFoundException("Proveedor", req.getProveedorId()));
            p.setProveedor(prov);
        }
        p.getItems().clear();
        p.getItems().addAll(buildItems(p, req.getItems()));
        return mapper.toDto(repo.save(p));
    }

    @Transactional
    public void delete(Long id) {
        PlantillaPedido p = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PlantillaPedido", id));
        p.setActivo(false);
        repo.save(p);
    }

    private List<ItemPlantillaPedido> buildItems(PlantillaPedido plantilla,
                                                  List<ItemPlantillaPedidoRequest> reqs) {
        if (reqs == null) return new ArrayList<>();
        List<ItemPlantillaPedido> items = new ArrayList<>();
        for (ItemPlantillaPedidoRequest r : reqs) {
            Producto prod = productoRepository.findById(r.getProductoId())
                    .orElseThrow(() -> new EntityNotFoundException("Producto", r.getProductoId()));
            ItemPlantillaPedido item = new ItemPlantillaPedido();
            item.setPlantilla(plantilla);
            item.setProducto(prod);
            item.setCantidadSolicitada(r.getCantidadSolicitada());
            item.setPrecio(r.getPrecio());
            items.add(item);
        }
        return items;
    }
}
