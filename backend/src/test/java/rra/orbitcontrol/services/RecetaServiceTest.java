package rra.orbitcontrol.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import rra.orbitcontrol.mappers.RecetaMapper;
import rra.orbitcontrol.models.dtos.responses.RecetaDTO;
import rra.orbitcontrol.models.entities.Receta;
import rra.orbitcontrol.repositories.RecetaRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecetaServiceTest {

    @Mock
    private RecetaRepository recetaRepository;

    @Mock
    private RecetaMapper recetaMapper;

    @InjectMocks
    private RecetaService recetaService;

    @Test
    void all_devuelveTodasLasRecetas() {
        Receta receta = new Receta();
        RecetaDTO dto = new RecetaDTO();
        when(recetaRepository.findAll()).thenReturn(List.of(receta));
        when(recetaMapper.toDtoList(List.of(receta))).thenReturn(List.of(dto));

        List<RecetaDTO> result = recetaService.all();

        assertEquals(1, result.size());
        verify(recetaRepository).findAll();
    }

    @Test
    void one_devuelveRecetaCuandoExiste() {
        Receta receta = new Receta();
        RecetaDTO dto = new RecetaDTO();
        when(recetaRepository.findById(1L)).thenReturn(Optional.of(receta));
        when(recetaMapper.toDto(receta)).thenReturn(dto);

        RecetaDTO result = recetaService.one(1L);

        assertNotNull(result);
    }

    @Test
    void one_lanzaExcepcionCuandoNoExiste() {
        when(recetaRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> recetaService.one(99L));
        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    void save_guardaYDevuelveDTO() {
        Receta receta = new Receta();
        RecetaDTO dto = new RecetaDTO();
        when(recetaRepository.save(receta)).thenReturn(receta);
        when(recetaMapper.toDto(receta)).thenReturn(dto);

        RecetaDTO result = recetaService.save(receta);

        assertNotNull(result);
        verify(recetaRepository).save(receta);
    }

    @Test
    void replace_actualizaRecetaExistente() {
        Receta existente = new Receta();
        existente.setId(1L);
        Receta nueva = new Receta();
        RecetaDTO dto = new RecetaDTO();
        when(recetaRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(recetaRepository.save(nueva)).thenReturn(nueva);
        when(recetaMapper.toDto(nueva)).thenReturn(dto);

        RecetaDTO result = recetaService.replace(1L, nueva);

        assertNotNull(result);
        assertEquals(1L, nueva.getId());
    }

    @Test
    void replace_lanzaExcepcionCuandoNoExiste() {
        when(recetaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> recetaService.replace(99L, new Receta()));
    }

    @Test
    void delete_llamaDeleteById() {
        recetaService.delete(1L);
        verify(recetaRepository).deleteById(1L);
    }
}
