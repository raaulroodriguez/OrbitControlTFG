package rra.orbitcontrol.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.responses.EventoAlmacenDTO;
import rra.orbitcontrol.models.dtos.requests.EventoAlmacenRequest;
import rra.orbitcontrol.services.EventoAlmacenService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/almacen/movimientos")
public class EventoAlmacenController {

    private final EventoAlmacenService movimientoService;

    EventoAlmacenController(EventoAlmacenService movimientoService) {
        this.movimientoService = movimientoService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        log.info("Listando movimientos de almacén: página {}", pagina);
        return ResponseEntity.ok(movimientoService.allPaged(pagina, tamanio));
    }

    @GetMapping("/producto/{id}")
    public ResponseEntity<List<EventoAlmacenDTO>> byProducto(@PathVariable Long id) {
        log.info("Listando movimientos del producto {}", id);
        return ResponseEntity.ok(movimientoService.byProducto(id));
    }

    @PostMapping
    public ResponseEntity<EventoAlmacenDTO> registrar(@RequestBody EventoAlmacenRequest req) {
        log.info("Registrando movimiento {} de {} uds del producto {}", req.getTipo(), req.getCantidad(), req.getProductoId());
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoService.registrar(req));
    }
}
