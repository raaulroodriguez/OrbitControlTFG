package rra.orbitcontrol.controllers;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.responses.LoteDTO;
import rra.orbitcontrol.models.entities.Lote;
import rra.orbitcontrol.models.enums.TipoEntidadLote;
import rra.orbitcontrol.services.LoteService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(value = "/api/lotes")
public class LoteController {

    private final LoteService loteService;

    LoteController(LoteService loteService) {
        this.loteService = loteService;
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<LoteDTO>> getAll() {
        log.info("Accediendo a todos los lotes");
        return ResponseEntity.ok(loteService.all());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoteDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo al lote con ID: {}", id);
        return ResponseEntity.ok(loteService.one(id));
    }

    @GetMapping("/entidad/{tipoEntidad}/{entidadId}")
    public ResponseEntity<List<LoteDTO>> getByEntidad(
            @PathVariable TipoEntidadLote tipoEntidad,
            @PathVariable Long entidadId) {
        log.info("Accediendo a lotes de {} con ID: {}", tipoEntidad, entidadId);
        return ResponseEntity.ok(loteService.findByEntidad(tipoEntidad, entidadId));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<LoteDTO>> getByPedido(@PathVariable Long pedidoId) {
        log.info("Accediendo a lotes del pedido con ID: {}", pedidoId);
        return ResponseEntity.ok(loteService.findByPedido(pedidoId));
    }

    @GetMapping("/proximos-caducar")
    public ResponseEntity<List<LoteDTO>> getProximosCaducar(
            @RequestParam(defaultValue = "30") int dias) {
        log.info("Accediendo a lotes próximos a caducar en {} días", dias);
        return ResponseEntity.ok(loteService.findProximosCaducar(dias));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<LoteDTO> newLote(@Valid @RequestBody Lote lote) {
        log.info("Creando nuevo lote: tipoEntidad={}, entidadId={}", lote.getTipoEntidad(), lote.getEntidadId());
        return new ResponseEntity<>(loteService.save(lote), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoteDTO> replaceLote(@PathVariable Long id, @Valid @RequestBody Lote lote) {
        log.info("Reemplazando el lote con ID: {}", id);
        return ResponseEntity.ok(loteService.replace(id, lote));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteLote(@PathVariable Long id) {
        log.info("Eliminando el lote con ID: {}", id);
        loteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
