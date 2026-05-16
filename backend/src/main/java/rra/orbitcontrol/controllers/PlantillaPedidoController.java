package rra.orbitcontrol.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.requests.PlantillaPedidoRequest;
import rra.orbitcontrol.models.dtos.responses.PlantillaPedidoDTO;
import rra.orbitcontrol.services.PlantillaPedidoService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/plantillas-pedido")
@RequiredArgsConstructor
public class PlantillaPedidoController {

    private final PlantillaPedidoService service;

    @GetMapping({"", "/"})
    public ResponseEntity<List<PlantillaPedidoDTO>> getAll() {
        return ResponseEntity.ok(service.all());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlantillaPedidoDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.one(id));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<PlantillaPedidoDTO> create(@RequestBody PlantillaPedidoRequest req) {
        log.info("Creando plantilla de pedido: {}", req.getNombre());
        return new ResponseEntity<>(service.crear(req), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlantillaPedidoDTO> update(@PathVariable Long id,
                                                      @RequestBody PlantillaPedidoRequest req) {
        log.info("Actualizando plantilla ID {}: {}", id, req.getNombre());
        return ResponseEntity.ok(service.actualizar(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Eliminando plantilla de pedido ID: {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
