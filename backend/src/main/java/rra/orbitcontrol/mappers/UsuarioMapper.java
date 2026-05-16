package rra.orbitcontrol.mappers;

import org.mapstruct.Mapper;
import rra.orbitcontrol.models.dtos.responses.UsuarioDTO;
import rra.orbitcontrol.models.entities.Usuario;
import rra.orbitcontrol.models.entities.UsuarioRol;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    UsuarioDTO toDto(Usuario usuario);

    List<UsuarioDTO> toDtoList(List<Usuario> usuarios);

    UsuarioDTO.RolDTO toRolDto(UsuarioRol usuarioRol);
}
