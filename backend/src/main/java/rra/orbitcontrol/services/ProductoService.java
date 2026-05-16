package rra.orbitcontrol.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.config.PushNotificationService;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.ProductoMapper;
import rra.orbitcontrol.models.dtos.responses.ProductoDTO;
import rra.orbitcontrol.models.entities.Producto;
import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.models.enums.TipoProducto;
import rra.orbitcontrol.repositories.ProductoRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductoService {

    private final ProductoRepository      productoRepository;
    private final ProductoMapper          productoMapper;
    private final PushNotificationService pushNotificationService;

    public ProductoService(ProductoRepository productoRepository, ProductoMapper productoMapper,
                           PushNotificationService pushNotificationService) {
        this.productoRepository      = productoRepository;
        this.productoMapper          = productoMapper;
        this.pushNotificationService = pushNotificationService;
    }

    public List<ProductoDTO> all() {
        return productoMapper.toDtoList(productoRepository.findAllWithProveedor());
    }

    // Combina búsqueda de texto y filtro por tipo de producto; si vienen los dos aplica los dos a la vez
    public Map<String, Object> allPaged(int pagina, int tamanio, String sortby, String sortDir, String search, String filtro) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortby).ascending() : Sort.by(sortby).descending();
        PageRequest pageable = PageRequest.of(pagina, tamanio, sort);

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasFiltro = filtro != null && !filtro.isBlank();

        Page<Producto> page;
        if (hasFiltro) {
            TipoProducto tipo = TipoProducto.valueOf(filtro);
            page = hasSearch
                ? productoRepository.searchPagedByTipo(search, tipo, pageable)
                : productoRepository.findByTipoProducto(tipo, pageable);
        } else {
            page = hasSearch ? productoRepository.searchPaged(search, pageable) : productoRepository.findAll(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("productos",    productoMapper.toDtoList(page.getContent()));
        response.put("currentPage",  page.getNumber());
        response.put("totalPages",   page.getTotalPages());
        response.put("total",        page.getTotalElements());
        return response;
    }

    public List<ProductoDTO> findByTipo(TipoProducto tipo) {
        return productoMapper.toDtoList(productoRepository.findByTipoProducto(tipo));
    }

    public Map<String, Object> stockBajo(int pagina, int tamanio) {
        PageRequest pageable = PageRequest.of(pagina, tamanio, Sort.by("stockActual").ascending());
        Page<Producto> page  = productoRepository.findStockBajo(pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("productos",   productoMapper.toDtoList(page.getContent()));
        response.put("currentPage", page.getNumber());
        response.put("totalPages",  page.getTotalPages());
        response.put("total",       page.getTotalElements());
        return response;
    }

    public void enviarAlerta(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));
        pushNotificationService.enviarARoles(
            List.of(RolNombre.ENCARGADO, RolNombre.ADMIN),
            "Stock bajo — " + p.getNombre(),
            "Quedan " + p.getStockActual() + ". Mínimo: " + p.getStockMinimo(),
            "/almacen/alertas"
        );
    }

    // Envía push notification por cada producto con stock bajo (máximo 100 a la vez)
    public void enviarTodasAlertas() {
        PageRequest pageable = PageRequest.of(0, 100, Sort.by("stockActual").ascending());
        productoRepository.findStockBajo(pageable).getContent().forEach(p ->
            pushNotificationService.enviarARoles(
                List.of(RolNombre.ENCARGADO, RolNombre.ADMIN),
                "Stock bajo — " + p.getNombre(),
                "Quedan " + p.getStockActual() + ". Mínimo: " + p.getStockMinimo(),
                "/almacen/alertas"
            )
        );
    }

    @Transactional
    public ProductoDTO save(Producto producto) {
        Producto saved = productoRepository.save(producto);
        // Recargamos con JOIN para que el DTO incluya los datos del proveedor,
        // que la entidad recién guardada no tiene populados todavía
        Producto conProveedor = productoRepository.findByIdWithProveedor(saved.getId())
                .orElse(saved);
        return productoMapper.toDto(conProveedor);
    }

    public ProductoDTO one(Long id) {
        Producto producto = productoRepository.findByIdWithProveedor(id)
                .orElseThrow(() -> new EntityNotFoundException("producto", id));
        return productoMapper.toDto(producto);
    }

    @Transactional
    public ProductoDTO replace(Long id, Producto producto) {
        productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("producto", id));
        producto.setId(id);
        Producto saved = productoRepository.save(producto);
        Producto conProveedor = productoRepository.findByIdWithProveedor(saved.getId())
                .orElse(saved);
        return productoMapper.toDto(conProveedor);
    }

    @Transactional
    public void delete(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new EntityNotFoundException("producto", id);
        }
        productoRepository.deleteById(id);
    }
}
