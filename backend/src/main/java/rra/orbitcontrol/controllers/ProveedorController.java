package rra.orbitcontrol.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.responses.ProveedorDTO;
import rra.orbitcontrol.models.entities.Proveedor;
import rra.orbitcontrol.services.ProveedorService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping(value = "/api/proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @GetMapping({"","/"})
    public ResponseEntity<List<ProveedorDTO>> getAll() {
        log.info("Accediendo a todos los proveedores");
        return ResponseEntity.ok(proveedorService.all());
    }

    @GetMapping(value = {"","/"}, params = "pagina")
    public ResponseEntity<Map<String, Object>> getAllPaged(
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "10") int tamanio,
            @RequestParam(defaultValue = "nombre") String sortBy,
            @RequestParam(defaultValue = "asc")    String sortDir,
            @RequestParam(defaultValue = "")       String search,
            @RequestParam(defaultValue = "")       String filtro) {
        log.info("Accediendo a proveedores paginados: página {}, tamaño {}", pagina, tamanio);
        return ResponseEntity.ok(proveedorService.allPaged(pagina, tamanio, sortBy, sortDir, search, filtro));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<ProveedorDTO> newProveedor(@RequestBody Proveedor proveedor) {
        log.info("Creando nuevo proveedor: {}", proveedor.getNombre());
        return new ResponseEntity<>(proveedorService.save(proveedor), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProveedorDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo al proveedor con ID: {}", id);
        return ResponseEntity.ok(proveedorService.one(id));
    }

    @GetMapping("/tipoProductos")
    public ResponseEntity<List<String>> getTiposProducto() {
        log.info("Accediendo a los tipos de producto disponibles");
        return ResponseEntity.ok(proveedorService.getTiposProducto());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProveedorDTO> replaceProveedor(@PathVariable Long id, @RequestBody Proveedor proveedor) {
        log.info("Reemplazando el proveedor con ID: {}", id);
        return ResponseEntity.ok(proveedorService.replace(id, proveedor));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteProveedor(@PathVariable Long id) {
        log.info("Eliminando el proveedor con ID: {}", id);
        proveedorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
