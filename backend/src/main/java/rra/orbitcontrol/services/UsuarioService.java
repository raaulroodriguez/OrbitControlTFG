package rra.orbitcontrol.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.exceptions.DuplicateEntityException;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.UsuarioMapper;
import rra.orbitcontrol.models.dtos.requests.NuevoUsuarioRequest;
import rra.orbitcontrol.models.dtos.responses.UsuarioDTO;
import rra.orbitcontrol.models.entities.Usuario;
import rra.orbitcontrol.models.entities.UsuarioRol;
import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.repositories.UsuarioRepository;
import rra.orbitcontrol.repositories.UsuarioRolRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          UsuarioRolRepository usuarioRolRepository,
                          PasswordEncoder passwordEncoder,
                          UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional(readOnly = true)
    public List<UsuarioDTO> all() {
        return usuarioMapper.toDtoList(usuarioRepository.findAllWithRoles());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> allPaged(int pagina, int tamanio, String sortBy, String sortDir, String search, String filtro) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(pagina, tamanio, sort);

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasFiltro = filtro != null && !filtro.isBlank();

        Page<Usuario> page;
        if (hasFiltro) {
            RolNombre rol = RolNombre.valueOf(filtro);
            page = hasSearch
                    ? usuarioRepository.searchPagedByRol(search, rol, pageable)
                    : usuarioRepository.findByRolPaged(rol, pageable);
        } else {
            page = hasSearch
                    ? usuarioRepository.searchPaged(search, pageable)
                    : usuarioRepository.findAll(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("usuarios",    usuarioMapper.toDtoList(page.getContent()));
        response.put("currentPage", page.getNumber());
        response.put("totalPages",  page.getTotalPages());
        response.put("total",       page.getTotalElements());
        return response;
    }

    @Transactional(readOnly = true)
    public boolean usernameDisponible(String username) {
        return !usuarioRepository.existsByNombreUsuario(username);
    }

    @Transactional
    public UsuarioDTO crear(NuevoUsuarioRequest request) {
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellidos(request.getApellidos())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .nombreUsuario(request.getNombreUsuario())
                .password(passwordEncoder.encode(request.getPassword()))
                .fechaAlta(LocalDateTime.now())
                .activo(request.isActivo())
                .nfcUid(request.getNfcUid())
                .build();

        List<UsuarioRol> roles = request.getRoles().stream()
                .map(r -> UsuarioRol.builder()
                        .usuario(usuario)
                        .rol(RolNombre.valueOf(r))
                        .fechaAsignacion(LocalDateTime.now())
                        .build())
                .toList();

        usuario.setRoles(roles);
        return usuarioMapper.toDto(usuarioRepository.save(usuario));
    }

    public UsuarioDTO save(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioMapper.toDto(usuarioRepository.save(usuario));
    }

    public UsuarioDTO one(Long id) {
        return usuarioMapper.toDto(usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario", id)));
    }

    @Transactional
    public UsuarioDTO replace(Long id, NuevoUsuarioRequest request) {
        return usuarioRepository.findById(id)
                .map(u -> {
                    u.setNombre(request.getNombre());
                    u.setApellidos(request.getApellidos());
                    u.setEmail(request.getEmail());
                    u.setTelefono(request.getTelefono());
                    u.setNombreUsuario(request.getNombreUsuario());
                    u.setActivo(request.isActivo());
                    u.setNfcUid(request.getNfcUid());

                    if (request.getPassword() != null && !request.getPassword().isBlank()) {
                        u.setPassword(passwordEncoder.encode(request.getPassword()));
                    }

                    if (request.getRoles() != null && !request.getRoles().isEmpty()) {
                        u.getRoles().clear();
                        List<UsuarioRol> roles = request.getRoles().stream()
                                .map(r -> UsuarioRol.builder()
                                        .usuario(u)
                                        .rol(RolNombre.valueOf(r))
                                        .fechaAsignacion(LocalDateTime.now())
                                        .build())
                                .toList();
                        u.getRoles().addAll(roles);
                    }

                    return usuarioMapper.toDto(usuarioRepository.save(u));
                })
                .orElseThrow(() -> new EntityNotFoundException("Usuario", id));
    }

    @Transactional
    public UsuarioDTO asignarTarjeta(Long id, String nfcUid) {
        usuarioRepository.findByNfcUid(nfcUid).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new DuplicateEntityException(
                        "Esta tarjeta ya está asignada a " + existing.getNombre() + " " + existing.getApellidos());
            }
        });
        return usuarioRepository.findById(id)
                .map(u -> {
                    u.setNfcUid(nfcUid);
                    return usuarioMapper.toDto(usuarioRepository.save(u));
                })
                .orElseThrow(() -> new EntityNotFoundException("Usuario", id));
    }

    @Transactional
    public void delete(Long id) {
        if (!usuarioRepository.existsById(id)) throw new EntityNotFoundException("Usuario", id);
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public void eliminarNFC(Long id) {
        usuarioRepository.findById(id)
                .map(u -> {
                    u.setNfcUid(null);
                    return usuarioRepository.save(u);
                })
                .orElseThrow(() -> new EntityNotFoundException("Usuario", id));
    }

    @Transactional
    public void cambiarPin(Long id, String pin) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario", id));
        usuario.setPassword(passwordEncoder.encode(pin));
        usuarioRepository.save(usuario);
    }

    public boolean verificarPassword(String passwordPlana, String passwordEncriptada) {
        return passwordEncoder.matches(passwordPlana, passwordEncriptada);
    }

    public List<String> getRoles() {
        return Arrays.stream(RolNombre.values())
                .map(Enum::name)
                .toList();
    }
}
