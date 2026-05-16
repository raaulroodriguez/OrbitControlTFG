package rra.orbitcontrol.controllers;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.requests.CambiarEstadoPedidoRequest;
import rra.orbitcontrol.models.dtos.requests.NuevoPedidoRequest;
import rra.orbitcontrol.models.dtos.responses.PedidoDTO;
import rra.orbitcontrol.models.entities.Pedido;
import rra.orbitcontrol.services.PedidoService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(value = "/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping({"","/"})
    public ResponseEntity<List<PedidoDTO>> getAll() {
        log.info("Accediendo a todos los pedidos");
        return ResponseEntity.ok(pedidoService.all());
    }

    @GetMapping("/borradores")
    public ResponseEntity<List<PedidoDTO>> getBorradores() {
        log.info("Accediendo a borradores");
        return ResponseEntity.ok(pedidoService.borradores());
    }

    @PostMapping({"", "/"})
    public ResponseEntity<PedidoDTO> newPedido(
            @Valid @RequestBody NuevoPedidoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Creando nuevo pedido por: {}", userDetails.getUsername());
        return new ResponseEntity<>(pedidoService.crear(request, userDetails.getUsername()), HttpStatus.CREATED);
    }

    @PostMapping("/borrador")
    public ResponseEntity<PedidoDTO> guardarBorrador(
            @RequestBody NuevoPedidoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Guardando borrador por: {}", userDetails.getUsername());
        return new ResponseEntity<>(pedidoService.guardarBorrador(request, userDetails.getUsername()), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> getOne(@PathVariable Long id) {
        log.info("Accediendo al pedido con ID: {}", id);
        return ResponseEntity.ok(pedidoService.one(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoDTO> replacePedido(@PathVariable Long id, @Valid @RequestBody Pedido pedido) {
        log.info("Reemplazando el pedido con ID: {}", id);
        return ResponseEntity.ok(pedidoService.replace(id, pedido));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoDTO> cambiarEstado(@PathVariable Long id,
                                                    @RequestBody CambiarEstadoPedidoRequest req) {
        log.info("Cambiando estado del pedido {} a {}", id, req.getEstado());
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, req.getEstado()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deletePedido(@PathVariable Long id) {
        log.info("Eliminando el pedido con ID: {}", id);
        pedidoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
