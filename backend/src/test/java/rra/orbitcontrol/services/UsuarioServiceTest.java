package rra.orbitcontrol.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import rra.orbitcontrol.mappers.UsuarioMapper;
import rra.orbitcontrol.models.dtos.responses.UsuarioDTO;
import rra.orbitcontrol.models.entities.Usuario;
import rra.orbitcontrol.repositories.UsuarioRepository;
import rra.orbitcontrol.repositories.UsuarioRolRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioRolRepository usuarioRolRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UsuarioMapper usuarioMapper;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void one_devuelveUsuarioCuandoExiste() {
        Usuario usuario = new Usuario();
        UsuarioDTO dto = new UsuarioDTO();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toDto(usuario)).thenReturn(dto);

        UsuarioDTO result = usuarioService.one(1L);

        assertNotNull(result);
        verify(usuarioRepository).findById(1L);
    }

    @Test
    void one_lanzaExcepcionCuandoNoExiste() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> usuarioService.one(99L));
        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    void asignarTarjeta_asignaCuandoNoHayConflicto() {
        Usuario usuario = Usuario.builder().id(1L).nombre("Test").build();
        UsuarioDTO dto = new UsuarioDTO();
        when(usuarioRepository.findByNfcUid("ABC123")).thenReturn(Optional.empty());
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);
        when(usuarioMapper.toDto(usuario)).thenReturn(dto);

        UsuarioDTO result = usuarioService.asignarTarjeta(1L, "ABC123");

        assertNotNull(result);
        assertEquals("ABC123", usuario.getNfcUid());
    }

    @Test
    void asignarTarjeta_lanzaConflictCuandoTarjetaYaAsignada() {
        Usuario otroUsuario = Usuario.builder().id(2L).nombre("Otro").apellidos("Usuario").build();
        when(usuarioRepository.findByNfcUid("ABC123")).thenReturn(Optional.of(otroUsuario));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.asignarTarjeta(1L, "ABC123"));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void verificarPassword_devuelveTrueSiCoincide() {
        when(passwordEncoder.matches("1234", "$2a$encoded")).thenReturn(true);

        assertTrue(usuarioService.verificarPassword("1234", "$2a$encoded"));
    }

    @Test
    void verificarPassword_devuelveFalseSiNoCoincide() {
        when(passwordEncoder.matches("wrong", "$2a$encoded")).thenReturn(false);

        assertFalse(usuarioService.verificarPassword("wrong", "$2a$encoded"));
    }

    @Test
    void delete_llamaDeleteById() {
        usuarioService.delete(1L);
        verify(usuarioRepository).deleteById(1L);
    }
}
