package rra.orbitcontrol.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.responses.RecetaDTO;
import rra.orbitcontrol.models.entities.Receta;
import rra.orbitcontrol.models.enums.TipoReceta;
import rra.orbitcontrol.services.RecetaService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping(value = "/api/recetas")
public class RecetaController {

    private final RecetaService recetaService;

    RecetaController(RecetaService recetaService) {
        this.recetaService = recetaService;
    }

    @GetMapping({"","/"})
    public ResponseEntity<List<RecetaDTO>> getAll() {
        log.info("Accediendo a todas las recetas");
        return ResponseEntity.ok(recetaService.all());
    }

    @GetMapping(value = {"","/"}, params = "pagina")
    public ResponseEntity<Map<String, Object>> getAllPaged(
            @RequestParam(defaultValue = "0")       int pagina,
            @RequestParam(defaultValue = "10")      int tamanio,
            @RequestParam(defaultValue = "nombre")  String sortBy,
            @RequestParam(defaultValue = "asc")     String sortDir,
            @RequestParam(defaultValue = "")        String search,
            @RequestParam(defaultValue = "")        String filtro) {
        log.info("Accediendo a recetas paginadas: página {}, tamaño {}", pagina, tamanio);
        return ResponseEntity.ok(recetaService.allPaged(pagina, tamanio, sortBy, sortDir, search, filtro));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<RecetaDTO>> getByTipo(@PathVariable TipoReceta tipo) {
        log.info("Accediendo a recetas de tipo: {}", tipo);
        return ResponseEntity.ok(recetaService.getByTipo(tipo));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<RecetaDTO> newReceta(@RequestBody Receta receta) {
        log.info("Creando nueva receta: {}", receta.getNombre());
        return new ResponseEntity<>(recetaService.save(receta), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecetaDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo a la receta con ID: {}", id);
        return ResponseEntity.ok(recetaService.one(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecetaDTO> replaceReceta(@PathVariable Long id, @RequestBody Receta receta) {
        log.info("Reemplazando la receta con ID: {}", id);
        return ResponseEntity.ok(recetaService.replace(id, receta));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteReceta(@PathVariable Long id) {
        log.info("Eliminando la receta con ID: {}", id);
        recetaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
