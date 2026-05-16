package rra.orbitcontrol.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rra.orbitcontrol.models.dtos.responses.AuthResponse;
import rra.orbitcontrol.models.dtos.requests.LoginRequest;
import rra.orbitcontrol.models.dtos.requests.RfidLoginRequest;
import rra.orbitcontrol.models.dtos.responses.UsuarioSelectorDTO;
import rra.orbitcontrol.services.AuthService;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/login-nfc")
    public ResponseEntity<AuthResponse> loginNfc(@RequestBody RfidLoginRequest request) {
        return ResponseEntity.ok(authService.loginNfc(request));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioSelectorDTO>> getUsuariosSelector() {
        return ResponseEntity.ok(authService.getUsuariosSelector());
    }
}
