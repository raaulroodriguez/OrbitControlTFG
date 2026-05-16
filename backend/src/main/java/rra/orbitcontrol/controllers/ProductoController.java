package rra.orbitcontrol.controllers;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.responses.ProductoDTO;
import rra.orbitcontrol.models.entities.Producto;
import rra.orbitcontrol.services.ProductoService;

import rra.orbitcontrol.models.enums.Envase;
import rra.orbitcontrol.models.enums.TipoProducto;
import rra.orbitcontrol.models.enums.UnidadMedida;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping(value = "/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping({"","/"})
    public ResponseEntity<List<ProductoDTO>> getAll() {
        log.info("Accediendo a todos los productos");
        return ResponseEntity.ok(productoService.all());
    }

    @GetMapping(value = {"","/"}, params = "pagina")
    public ResponseEntity<Map<String, Object>> getAllPaged(
            @RequestParam(defaultValue = "0")       int pagina,
            @RequestParam(defaultValue = "10")      int tamanio,
            @RequestParam(defaultValue = "nombre")  String sortBy,
            @RequestParam(defaultValue = "asc")     String sortDir,
            @RequestParam(defaultValue = "")        String search,
            @RequestParam(defaultValue = "")        String filtro) {
        log.info("Accediendo a productos paginados: página {}, tamaño {}", pagina, tamanio);
        return ResponseEntity.ok(productoService.allPaged(pagina, tamanio, sortBy, sortDir, search, filtro));
    }

    @GetMapping("/unidadesMedida")
    public ResponseEntity<List<String>> getUnidadesMedida() {
        return ResponseEntity.ok(
            Arrays.stream(UnidadMedida.values()).map(Enum::name).toList()
        );
    }

    @GetMapping("/envases")
    public ResponseEntity<List<String>> getEnvases() {
        return ResponseEntity.ok(
            Arrays.stream(Envase.values()).map(Enum::name).toList()
        );
    }

    @GetMapping("/tipoProductos")
    public ResponseEntity<List<String>> getTipoProductos() {
        return ResponseEntity.ok(
            Arrays.stream(TipoProducto.values()).map(Enum::name).toList()
        );
    }

    @GetMapping("/alertas/stockBajo")
    public ResponseEntity<Map<String, Object>> stockBajo(
            @RequestParam(defaultValue = "0")  int pagina,
            @RequestParam(defaultValue = "10") int tamanio) {
        return ResponseEntity.ok(productoService.stockBajo(pagina, tamanio));
    }

    @PostMapping("/{id}/alerta")
    public ResponseEntity<Void> enviarAlerta(@PathVariable Long id) {
        productoService.enviarAlerta(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/alertas/enviar")
    public ResponseEntity<Void> enviarTodasAlertas() {
        productoService.enviarTodasAlertas();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tipoProducto/{tipo}")
    public ResponseEntity<List<ProductoDTO>> getByTipoProducto(@PathVariable TipoProducto tipo) {
        log.info("Accediendo a los productos con Tipo: {}", tipo);
        return ResponseEntity.ok(productoService.findByTipo(tipo));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<ProductoDTO> newProducto(@Valid @RequestBody Producto producto) {
        log.info("Creando nuevo producto: {}", producto.getNombre());
        ProductoDTO nuevoProducto = productoService.save(producto);
        return new ResponseEntity<>(nuevoProducto, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo al producto con ID: {}", id);
        return ResponseEntity.ok(productoService.one(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> replaceProducto(@PathVariable Long id, @Valid @RequestBody Producto producto) {
        log.info("Reemplazando el producto con ID: {}", id);
        return ResponseEntity.ok(productoService.replace(id, producto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        log.info("Eliminando el producto con ID: {}", id);
        productoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
