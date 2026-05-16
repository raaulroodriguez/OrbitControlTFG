package rra.orbitcontrol.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.exceptions.InsufficientStockException;
import rra.orbitcontrol.models.dtos.responses.EventoAlmacenDTO;
import rra.orbitcontrol.config.PushNotificationService;
import rra.orbitcontrol.models.dtos.requests.EventoAlmacenRequest;
import rra.orbitcontrol.models.entities.EventoAlmacen;
import rra.orbitcontrol.models.entities.Producto;
import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.repositories.EventoAlmacenRepository;
import rra.orbitcontrol.repositories.ProductoRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventoAlmacenService {

    private final EventoAlmacenRepository movimientoRepository;
    private final ProductoRepository          productoRepository;
    private final PushNotificationService       pushNotificationService;

    public EventoAlmacenService(EventoAlmacenRepository movimientoRepository,
                                    ProductoRepository productoRepository,
                                    PushNotificationService pushNotificationService) {
        this.movimientoRepository = movimientoRepository;
        this.productoRepository   = productoRepository;
        this.pushNotificationService = pushNotificationService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> allPaged(int pagina, int tamanio) {
        PageRequest pageable = PageRequest.of(pagina, tamanio, Sort.by("fecha").descending());
        Page<EventoAlmacen> page = movimientoRepository.findAllByOrderByFechaDesc(pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("movimientos",  page.getContent().stream().map(this::toDto).toList());
        response.put("currentPage",  page.getNumber());
        response.put("totalPages",   page.getTotalPages());
        response.put("total",        page.getTotalElements());
        return response;
    }

    @Transactional(readOnly = true)
    public List<EventoAlmacenDTO> byProducto(Long productoId) {
        return movimientoRepository.findByProductoIdOrderByFechaDesc(productoId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public EventoAlmacenDTO registrar(EventoAlmacenRequest req) {
        Producto producto = productoRepository.findById(req.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto", req.getProductoId()));

        switch (req.getTipo()) {
            case ENTRADA -> producto.setStockActual(producto.getStockActual() + req.getCantidad());
            case SALIDA  -> {
                if (producto.getStockActual() < req.getCantidad())
                    throw new InsufficientStockException(
                            producto.getNombre(), req.getCantidad(), producto.getStockActual(),
                            producto.getUnidadMedida().name());
                producto.setStockActual(producto.getStockActual() - req.getCantidad());
            }
            case AJUSTE  -> producto.setStockActual(req.getCantidad());
        }
        productoRepository.save(producto);
        comprobarStockMinimo(producto);

        EventoAlmacen mov = EventoAlmacen.builder()
                .producto(producto)
                .tipo(req.getTipo())
                .cantidad(req.getCantidad())
                .motivo(req.getMotivo())
                .fecha(LocalDateTime.now())
                .build();

        return toDto(movimientoRepository.save(mov));
    }

    private void comprobarStockMinimo(Producto producto) {
        if (producto.getStockActual() <= producto.getStockMinimo()) {
            pushNotificationService.enviarARoles(
                List.of(RolNombre.ENCARGADO, RolNombre.ADMIN),
                "Stock bajo - " + producto.getNombre(),
                "Quedan " + producto.getStockActual() + ". Stock Mínimo: " + producto.getStockMinimo(),
                "/almacen/alertas"
            );
        }
    }

    private EventoAlmacenDTO toDto(EventoAlmacen m) {
        EventoAlmacenDTO dto = new EventoAlmacenDTO();
        dto.setId(m.getId());
        dto.setProductoId(m.getProducto().getId());
        dto.setProductoNombre(m.getProducto().getNombre());
        dto.setTipo(m.getTipo());
        dto.setCantidad(m.getCantidad());
        dto.setMotivo(m.getMotivo());
        dto.setFecha(m.getFecha());
        return dto;
    }
}
