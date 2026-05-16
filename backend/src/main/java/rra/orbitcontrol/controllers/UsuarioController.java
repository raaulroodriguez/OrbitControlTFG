package rra.orbitcontrol.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.requests.CambiarPinRequest;
import rra.orbitcontrol.models.dtos.requests.NuevoUsuarioRequest;
import rra.orbitcontrol.models.dtos.requests.RfidLoginRequest;
import rra.orbitcontrol.models.dtos.responses.UsuarioDTO;
import rra.orbitcontrol.services.UsuarioService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping(value = "/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping({"","/"})
    public ResponseEntity<List<UsuarioDTO>> getAll() {
        log.info("Accediendo a todos los usuarios");
        return ResponseEntity.ok(usuarioService.all());
    }

    @GetMapping(value = {"","/"}, params = "pagina")
    public ResponseEntity<Map<String, Object>> getAllPaged(
            @RequestParam(defaultValue = "0")      int    pagina,
            @RequestParam(defaultValue = "10")     int    tamanio,
            @RequestParam(defaultValue = "nombre") String sortBy,
            @RequestParam(defaultValue = "asc")    String sortDir,
            @RequestParam(defaultValue = "")       String search,
            @RequestParam(defaultValue = "")       String filtro) {
        log.info("Accediendo a usuarios paginados: página {}, tamaño {}", pagina, tamanio);
        return ResponseEntity.ok(usuarioService.allPaged(pagina, tamanio, sortBy, sortDir, search, filtro));
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles() {
        log.info("Accediendo a los roles disponibles");
        return ResponseEntity.ok(usuarioService.getRoles());
    }

    @GetMapping("/comprobarusername/{username}")
    public ResponseEntity<Boolean> comprobarUsername(@PathVariable String username) {
        return ResponseEntity.ok(usuarioService.usernameDisponible(username));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<UsuarioDTO> newUsuario(@RequestBody NuevoUsuarioRequest request) {
        log.info("Creando nuevo usuario: {}", request.getNombreUsuario());
        return new ResponseEntity<>(usuarioService.crear(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo al usuario con ID: {}", id);
        return ResponseEntity.ok(usuarioService.one(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> replaceUsuario(@PathVariable Long id, @RequestBody NuevoUsuarioRequest request) {
        log.info("Reemplazando el usuario con ID: {}", id);
        return ResponseEntity.ok(usuarioService.replace(id, request));
    }

    @PutMapping("/{id}/nfc")
    public ResponseEntity<UsuarioDTO> asignarTarjeta(@PathVariable Long id, @RequestBody RfidLoginRequest request) {
        log.info("Asignando tarjeta NFC al usuario con ID: {}", id);
        return ResponseEntity.ok(usuarioService.asignarTarjeta(id, request.getNfcUid()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        log.info("Eliminando el usuario con ID: {}", id);
        usuarioService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/nfc")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> eliminarNFC(@PathVariable Long id) {
        log.info("Eliminando tarjeta NFC del usuario con ID: {}", id);
        usuarioService.eliminarNFC(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<Void> cambiarPin(@PathVariable Long id, @RequestBody CambiarPinRequest request) {
        log.info("Cambiando PIN del usuario con ID: {}", id);
        usuarioService.cambiarPin(id, request.getPin());
        return ResponseEntity.ok().build();
    }
}
