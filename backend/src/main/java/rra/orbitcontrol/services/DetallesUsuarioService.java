package rra.orbitcontrol.services;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import rra.orbitcontrol.models.entities.Usuario;
import rra.orbitcontrol.repositories.UsuarioRepository;

import java.util.stream.Collectors;

@Service
public class DetallesUsuarioService implements UserDetailsService{

    private final UsuarioRepository usuarioRepository;

    public DetallesUsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNombreUsuarioWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return User.builder()
                .username(usuario.getNombreUsuario())
                .password(usuario.getPassword())
                .authorities(usuario.getRoles().stream()
                        .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRol().name()))
                        .collect(Collectors.toList()))
                .build();
    }

    public UserDetails loadUserByNfc(String nfcUid) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNfcUidWithRoles(nfcUid)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con NFC: " + nfcUid));

        return User.builder()
                .username(usuario.getNombreUsuario())
                .password(usuario.getPassword())
                .authorities(usuario.getRoles().stream()
                        .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRol().name()))
                        .collect(Collectors.toList()))
                .build();
    }
}