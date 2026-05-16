package rra.orbitcontrol.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.requests.ConsumirRequest;
import rra.orbitcontrol.models.dtos.responses.EventoHeladoDTO;
import rra.orbitcontrol.models.dtos.requests.ElaborarRequest;
import rra.orbitcontrol.models.dtos.responses.HeladoElaboradoDTO;
import rra.orbitcontrol.models.entities.HeladoElaborado;
import rra.orbitcontrol.services.HeladoElaboradoService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(value = "/api/helados/inventario")
public class HeladoElaboradoController {

    private final HeladoElaboradoService heladoElaboradoService;

    HeladoElaboradoController(HeladoElaboradoService heladoElaboradoService) {
        this.heladoElaboradoService = heladoElaboradoService;
    }

    @GetMapping({"","/"})
    public ResponseEntity<List<HeladoElaboradoDTO>> getAll() {
        log.info("Accediendo a todos los helados elaborados");
        return ResponseEntity.ok(heladoElaboradoService.all());
    }

    @GetMapping("/recientes")
    public ResponseEntity<List<HeladoElaboradoDTO>> recientes() {
        return ResponseEntity.ok(heladoElaboradoService.recientes());
    }

    @GetMapping("/recientes-agrupados")
    public ResponseEntity<List<EventoHeladoDTO>> recientesAgrupados() {
        return ResponseEntity.ok(heladoElaboradoService.recientesAgrupados());
    }

    @GetMapping("/consumidos")
    public ResponseEntity<List<HeladoElaboradoDTO>> consumidos() {
        return ResponseEntity.ok(heladoElaboradoService.consumidos());
    }

    @GetMapping("/consumidos-agrupados")
    public ResponseEntity<List<EventoHeladoDTO>> consumidosAgrupados() {
        return ResponseEntity.ok(heladoElaboradoService.consumidosAgrupados());
    }

    @PostMapping("/consumir")
    public ResponseEntity<List<HeladoElaboradoDTO>> consumir(@RequestBody ConsumirRequest req) {
        log.info("Consumiendo {} unidades del helado id {}", req.getCantidad(), req.getHeladoId());
        return ResponseEntity.ok(heladoElaboradoService.consumir(req));
    }

    @PostMapping("/elaborar")
    public ResponseEntity<List<HeladoElaboradoDTO>> elaborar(@RequestBody ElaborarRequest req) {
        log.info("Elaborando {} unidades del helado id {}", req.getCantidad(), req.getHeladoId());
        return ResponseEntity.status(HttpStatus.CREATED).body(heladoElaboradoService.elaborar(req));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<HeladoElaboradoDTO> newHeladoElaborado(@RequestBody HeladoElaborado heladoElaborado) {
        log.info("Creando nuevo helado elaborado: {}", heladoElaborado.getCodigoProd());
        return ResponseEntity.ok(heladoElaboradoService.crear(heladoElaborado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HeladoElaboradoDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo al helado elaborado con ID: {}", id);
        return ResponseEntity.ok(heladoElaboradoService.one(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HeladoElaboradoDTO> replaceHeladoElaborado(@PathVariable Long id,
                                                                      @RequestBody HeladoElaborado heladoElaborado) {
        log.info("Reemplazando el helado elaborado con ID: {}", id);
        return ResponseEntity.ok(heladoElaboradoService.replace(id, heladoElaborado));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteHeladoElaborado(@PathVariable Long id) {
        log.info("Eliminando el helado elaborado con ID: {}", id);
        heladoElaboradoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
