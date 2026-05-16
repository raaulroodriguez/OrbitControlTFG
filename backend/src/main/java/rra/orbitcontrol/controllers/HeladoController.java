package rra.orbitcontrol.controllers;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.responses.HeladoDTO;
import rra.orbitcontrol.models.entities.Helado;
import rra.orbitcontrol.services.HeladoService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping(value = "/api/helados")
public class HeladoController {

    private final HeladoService heladoService;

    HeladoController(HeladoService heladoService) {
        this.heladoService = heladoService;
    }

    @GetMapping({"","/"})
    public ResponseEntity<List<HeladoDTO>> getAll() {
        log.info("Accediendo a todos los helados");
        return ResponseEntity.ok(heladoService.all());
    }

    @GetMapping(value = {"","/"}, params = "pagina")
    public ResponseEntity<Map<String, Object>> getAllPaged(
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "10") int tamanio,
            @RequestParam(defaultValue = "nombre") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String filtro) {
        log.info("Accediendo a helados paginados: página {}, tamaño {}", pagina, tamanio);
        return ResponseEntity.ok(heladoService.allPaged(pagina, tamanio, sortBy, sortDir, search, filtro));
    }

    @GetMapping("/alertas/stockBajo")
    public ResponseEntity<Map<String, Object>> stockBajo(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanio) {
        return ResponseEntity.ok(heladoService.stockBajo(pagina, tamanio));
    }

    @PostMapping("/{id}/alerta")
    public ResponseEntity<Void> enviarAlerta(@PathVariable Long id) {
        heladoService.enviarAlerta(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/alertas/enviar")
    public ResponseEntity<Void> enviarTodasAlertas() {
        heladoService.enviarTodasAlertas();
        return ResponseEntity.ok().build();
    }

    @PostMapping({"", "/"})
    public ResponseEntity<HeladoDTO> newHelado(@Valid @RequestBody Helado helado) {
        log.info("Creando nuevo helado: {}", helado.getNombre());
        return new ResponseEntity<>(heladoService.save(helado), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HeladoDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo al helado con ID: {}", id);
        return ResponseEntity.ok(heladoService.one(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HeladoDTO> replaceHelado(@PathVariable Long id, @RequestBody Helado helado) {
        log.info("Reemplazando el helado con ID: {}", id);
        return ResponseEntity.ok(heladoService.replace(id, helado));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteHelado(@PathVariable Long id) {
        log.info("Eliminando el helado con ID: {}", id);
        heladoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
