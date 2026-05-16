package rra.orbitcontrol.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import rra.orbitcontrol.models.enums.Plataforma;
import rra.orbitcontrol.services.DispositivoTokenService;

@RestController
@RequestMapping("/api/notificaciones")
public class DispositivoTokenController {

    private final DispositivoTokenService dispositivoTokenService;

    public DispositivoTokenController(DispositivoTokenService dispositivoTokenService) {
        this.dispositivoTokenService = dispositivoTokenService;
    }

    @PostMapping("/token")
    public ResponseEntity<Void> registrarToken(@RequestBody TokenRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        dispositivoTokenService.registrarPorUsername(userDetails.getUsername(), request.token(), Plataforma.valueOf(request.plataforma()));
        return ResponseEntity.ok().build();
    }

    public record TokenRequest(String token, String plataforma) { }
}
