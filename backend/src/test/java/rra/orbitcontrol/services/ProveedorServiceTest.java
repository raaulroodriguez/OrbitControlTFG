package rra.orbitcontrol.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import rra.orbitcontrol.mappers.ProveedorMapper;
import rra.orbitcontrol.models.dtos.responses.ProveedorDTO;
import rra.orbitcontrol.models.entities.Proveedor;
import rra.orbitcontrol.models.enums.TipoProducto;
import rra.orbitcontrol.repositories.ProveedorRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProveedorServiceTest {

    @Mock
    private ProveedorRepository proveedorRepository;

    @Mock
    private ProveedorMapper proveedorMapper;

    @InjectMocks
    private ProveedorService proveedorService;

    @Test
    void all_devuelveTodosLosProveedores() {
        Proveedor proveedor = new Proveedor();
        ProveedorDTO dto = new ProveedorDTO();
        when(proveedorRepository.findAll()).thenReturn(List.of(proveedor));
        when(proveedorMapper.toDtoList(List.of(proveedor))).thenReturn(List.of(dto));

        List<ProveedorDTO> result = proveedorService.all();

        assertEquals(1, result.size());
        verify(proveedorRepository).findAll();
    }

    @Test
    void one_devuelveProveedorCuandoExiste() {
        Proveedor proveedor = new Proveedor();
        ProveedorDTO dto = new ProveedorDTO();
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(proveedor));
        when(proveedorMapper.toDto(proveedor)).thenReturn(dto);

        ProveedorDTO result = proveedorService.one(1L);

        assertNotNull(result);
    }

    @Test
    void one_lanzaExcepcionCuandoNoExiste() {
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> proveedorService.one(99L));
        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    void save_guardaYDevuelveDTO() {
        Proveedor proveedor = new Proveedor();
        ProveedorDTO dto = new ProveedorDTO();
        when(proveedorRepository.save(proveedor)).thenReturn(proveedor);
        when(proveedorMapper.toDto(proveedor)).thenReturn(dto);

        ProveedorDTO result = proveedorService.save(proveedor);

        assertNotNull(result);
        verify(proveedorRepository).save(proveedor);
    }

    @Test
    void replace_actualizaProveedorExistente() {
        Proveedor existente = new Proveedor();
        existente.setId(1L);
        Proveedor nuevo = new Proveedor();
        ProveedorDTO dto = new ProveedorDTO();
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(proveedorRepository.save(nuevo)).thenReturn(nuevo);
        when(proveedorMapper.toDto(nuevo)).thenReturn(dto);

        ProveedorDTO result = proveedorService.replace(1L, nuevo);

        assertNotNull(result);
        assertEquals(1L, nuevo.getId());
    }

    @Test
    void replace_lanzaExcepcionCuandoNoExiste() {
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> proveedorService.replace(99L, new Proveedor()));
    }

    @Test
    void delete_llamaDeleteById() {
        proveedorService.delete(1L);
        verify(proveedorRepository).deleteById(1L);
    }

    @Test
    void getTiposProducto_devuelveTodosLosValoresDelEnum() {
        List<String> tipos = proveedorService.getTiposProducto();

        assertEquals(TipoProducto.values().length, tipos.size());
        assertTrue(tipos.contains("OBRADOR"));
        assertTrue(tipos.contains("TIENDA"));
        assertTrue(tipos.contains("AMBOS"));
    }
}
