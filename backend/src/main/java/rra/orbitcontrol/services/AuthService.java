package rra.orbitcontrol.services;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import rra.orbitcontrol.config.JwtService;
import rra.orbitcontrol.models.dtos.responses.AuthResponse;
import rra.orbitcontrol.models.dtos.requests.LoginRequest;
import rra.orbitcontrol.models.dtos.requests.RfidLoginRequest;
import rra.orbitcontrol.models.dtos.responses.UsuarioSelectorDTO;
import rra.orbitcontrol.repositories.UsuarioRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final DetallesUsuarioService detallesUsuarioService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;

    public AuthResponse login(LoginRequest request) {
        // Spring Security valida las credenciales; lanza BadCredentialsException si son incorrectas
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getNombreUsuario(),
                        request.getPassword()
                )
        );

        UserDetails user = detallesUsuarioService.loadUserByUsername(request.getNombreUsuario());
        String jwtToken = jwtService.generateToken(user, "PIN");

        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthResponse loginNfc(RfidLoginRequest request) {
        // Buscamos el usuario por el UID de la tarjeta NFC
        UserDetails user = detallesUsuarioService.loadUserByNfc(request.getNfcUid());
        String jwtToken = jwtService.generateToken(user, "NFC");

        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public List<UsuarioSelectorDTO> getUsuariosSelector() {
        // Solo devolvemos usuarios activos, ordenados por nombre para el selector del login
        return usuarioRepository.findByActivoTrue().stream()
                .map(u -> UsuarioSelectorDTO.builder()
                        .id(u.getId())
                        .nombre(u.getNombre())
                        .apellidos(u.getApellidos())
                        .nombreUsuario(u.getNombreUsuario())
                        .roles(u.getRoles().stream().map(r -> r.getRol().name()).collect(Collectors.toList()))
                        .build())
                .sorted(Comparator.comparing(UsuarioSelectorDTO::getNombre, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }
}
