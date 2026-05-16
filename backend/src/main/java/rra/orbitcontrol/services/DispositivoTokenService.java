package rra.orbitcontrol.services;

import org.springframework.stereotype.Service;
import rra.orbitcontrol.models.entities.DispositivoToken;
import rra.orbitcontrol.models.entities.Usuario;
import rra.orbitcontrol.models.enums.Plataforma;
import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.repositories.DispositivoTokenRepository;
import rra.orbitcontrol.repositories.UsuarioRepository;
import java.util.List;

@Service
public class DispositivoTokenService {

    private final DispositivoTokenRepository dispositivoTokenRepository;
    private final UsuarioRepository usuarioRepository;

    public DispositivoTokenService (DispositivoTokenRepository dispositivoTokenRepository, UsuarioRepository usuarioRepository) {
        this.dispositivoTokenRepository = dispositivoTokenRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public void registrarPorUsername(String username, String token, Plataforma plataforma) {
        if (dispositivoTokenRepository.findByToken(token).isPresent()) return;

        Usuario usuario = usuarioRepository.findByNombreUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

        DispositivoToken dispositivoToken = new DispositivoToken();
        dispositivoToken.setUsuario(usuario);
        dispositivoToken.setToken(token);
        dispositivoToken.setPlataforma(plataforma);
        dispositivoTokenRepository.save(dispositivoToken);
    }

    public List<String> getTokenPorRol(RolNombre rol) {
        return dispositivoTokenRepository.findByRol(rol).stream()
                .map(DispositivoToken::getToken)
                .toList();
    }

    public void eliminarToken(String token) {
        dispositivoTokenRepository.findByToken(token).ifPresent(dispositivoTokenRepository::delete);
    }
    
}
