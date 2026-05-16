package rra.orbitcontrol.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.ProveedorMapper;
import rra.orbitcontrol.models.dtos.responses.ProveedorDTO;
import rra.orbitcontrol.models.entities.Proveedor;
import rra.orbitcontrol.models.enums.TipoProducto;
import rra.orbitcontrol.repositories.ProveedorRepository;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final ProveedorMapper proveedorMapper;

    public ProveedorService(ProveedorRepository proveedorRepository, ProveedorMapper proveedorMapper) {
        this.proveedorRepository = proveedorRepository;
        this.proveedorMapper = proveedorMapper;
    }

    public List<ProveedorDTO> all() {
        return proveedorMapper.toDtoList(proveedorRepository.findAll());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> allPaged(int pagina, int tamanio, String sortBy, String sortDir, String search, String filtro) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(pagina, tamanio, sort);

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasFiltro = filtro != null && !filtro.isBlank();

        Page<Proveedor> page;
        if (hasFiltro) {
            TipoProducto tipo = TipoProducto.valueOf(filtro);
            page = hasSearch
                    ? proveedorRepository.searchPagedByTipo(search, tipo, pageable)
                    : proveedorRepository.findByTipoProducto(tipo, pageable);
        } else {
            page = hasSearch
                    ? proveedorRepository.searchPaged(search, pageable)
                    : proveedorRepository.findAll(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("proveedores",  proveedorMapper.toDtoList(page.getContent()));
        response.put("currentPage",  page.getNumber());
        response.put("totalPages",   page.getTotalPages());
        response.put("total",        page.getTotalElements());
        return response;
    }

    public ProveedorDTO save(Proveedor proveedor) {
        return proveedorMapper.toDto(proveedorRepository.save(proveedor));
    }

    public ProveedorDTO one(Long id) {
        return proveedorMapper.toDto(proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor", id)));
    }

    @Transactional
    public ProveedorDTO replace(Long id, Proveedor proveedor) {
        return proveedorRepository.findById(id)
                .map(p -> {
                    proveedor.setId(p.getId());
                    return proveedorMapper.toDto(proveedorRepository.save(proveedor));
                })
                .orElseThrow(() -> new EntityNotFoundException("Proveedor", id));
    }

    @Transactional
    public void delete(Long id) {
        if (!proveedorRepository.existsById(id)) throw new EntityNotFoundException("Proveedor", id);
        proveedorRepository.deleteById(id);
    }

    public List<String> getTiposProducto() {
        return Arrays.stream(TipoProducto.values())
                .map(Enum::name)
                .toList();
    }
}
