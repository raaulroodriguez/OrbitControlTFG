package rra.orbitcontrol.services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.RecetaMapper;
import rra.orbitcontrol.models.dtos.responses.RecetaDTO;
import rra.orbitcontrol.models.entities.Helado;
import rra.orbitcontrol.models.entities.IngredienteReceta;
import rra.orbitcontrol.models.entities.Receta;
import rra.orbitcontrol.models.enums.TipoHelado;
import rra.orbitcontrol.models.enums.TipoReceta;
import rra.orbitcontrol.models.enums.UnidadMedida;
import rra.orbitcontrol.repositories.HeladoRepository;
import rra.orbitcontrol.repositories.ProductoRepository;
import rra.orbitcontrol.repositories.RecetaRepository;
import org.springframework.context.annotation.Lazy;
import rra.orbitcontrol.utils.ConversionUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecetaService {

    @PersistenceContext
    private EntityManager em;

    private final RecetaRepository   recetaRepository;
    private final ProductoRepository productoRepository;
    private final HeladoRepository   heladoRepository;
    private final HeladoService      heladoService;
    private final RecetaMapper       recetaMapper;

    public RecetaService(RecetaRepository recetaRepository,
                         ProductoRepository productoRepository,
                         HeladoRepository heladoRepository,
                         @Lazy HeladoService heladoService,
                         RecetaMapper recetaMapper) {
        this.recetaRepository   = recetaRepository;
        this.productoRepository = productoRepository;
        this.heladoRepository   = heladoRepository;
        this.heladoService      = heladoService;
        this.recetaMapper       = recetaMapper;
    }

    @Transactional(readOnly = true)
    public List<RecetaDTO> all() {
        return enriquecerLista(recetaMapper.toDtoList(recetaRepository.findAll()));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> allPaged(int pagina, int tamanio, String sortBy, String sortDir, String search, String filtro) {
        Sort sort;
        if ("tipo".equals(sortBy)) {
            sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by("tipoReceta", "tipoHelado").ascending()
                : Sort.by("tipoReceta", "tipoHelado").descending();
        } else {
            sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        }

        PageRequest pageable = PageRequest.of(pagina, tamanio, sort);

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasFiltro = filtro != null && !filtro.isBlank();

        Page<Receta> page;
        if (hasFiltro) {
            boolean esTipoHelado = isTipoHelado(filtro);
            if (esTipoHelado) {
                TipoHelado tipo = TipoHelado.valueOf(filtro);
                page = hasSearch
                    ? recetaRepository.searchPagedByTipoHelado(search, tipo, pageable)
                    : recetaRepository.findByTipoHelado(tipo, pageable);
            } else {
                TipoReceta tipo = TipoReceta.valueOf(filtro);
                page = hasSearch
                    ? recetaRepository.searchPagedByTipoReceta(search, tipo, pageable)
                    : recetaRepository.findByTipoReceta(tipo, pageable);
            }
        } else {
            page = hasSearch
                ? recetaRepository.searchPaged(search, pageable)
                : recetaRepository.findAll(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("recetas",     enriquecerLista(recetaMapper.toDtoList(page.getContent())));
        response.put("currentPage", page.getNumber());
        response.put("totalPages",  page.getTotalPages());
        response.put("total",       page.getTotalElements());
        return response;
    }

    private boolean isTipoHelado(String valor) {
        try { TipoHelado.valueOf(valor); return true; } catch (IllegalArgumentException e) { return false; }
    }

    @Transactional(readOnly = true)
    public List<RecetaDTO> getByTipo(TipoReceta tipo) {
        return enriquecerLista(recetaMapper.toDtoList(recetaRepository.findByTipoReceta(tipo)));
    }

    /** Limpia el caché L1, recarga la receta completa y persiste el coste calculado. */
    private void persistirCoste(Long id) {
        em.flush();
        em.clear();
        recetaRepository.findByIdWithAll(id).ifPresent(full -> {
            full.setCosteElaboracion(heladoService.calcularCoste(full));
            recetaRepository.save(full);
        });
    }

    /** Para uso del DataInitializer: recalcula y persiste el coste de todas las recetas. */
    @Transactional
    public void recalcularTodosLosCoste() {
        em.flush();
        em.clear();
        recetaRepository.findAll().forEach(r ->
            recetaRepository.findByIdWithAll(r.getId()).ifPresent(full -> {
                full.setCosteElaboracion(heladoService.calcularCoste(full));
                recetaRepository.save(full);
            })
        );
    }

    private List<RecetaDTO> enriquecerLista(List<RecetaDTO> dtos) {
        dtos.forEach(this::enriquecerSubrecetaCostes);
        return dtos;
    }

    private void enriquecerSubrecetaCostes(RecetaDTO dto) {
        if (dto.getIngredientes() == null) return;
        dto.getIngredientes().forEach(ing -> {
            if (ing.getSubrecetaId() != null) {
                recetaRepository.findByIdWithAll(ing.getSubrecetaId()).ifPresent(sub -> {
                    double costeTotal = heladoService.calcularCoste(sub);
                    double rendimiento = sub.getIngredientes().stream()
                            .filter(si -> si.getProducto() != null)
                            .mapToDouble(si -> si.getCantidad())
                            .sum();
                    ing.setSubrecetaCoste(rendimiento > 0 ? costeTotal / rendimiento : 0);
                });
            }
        });
    }

    @Transactional
    public RecetaDTO save(Receta receta) {
        if (receta.getIngredientes() != null) {
            receta.getIngredientes().forEach(ing -> {
                ing.setReceta(receta);
                resolverConversion(ing);
            });
        }
        Receta saved = recetaRepository.save(receta);

        persistirCoste(saved.getId());

        if (saved.getTipoReceta() == TipoReceta.HELADO) {
            Helado helado = Helado.builder()
                    .nombre(saved.getNombre())
                    .tipo(saved.getTipoHelado())
                    .receta(saved)
                    .stockActual(0)
                    .stockMinimo(receta.getStockMinimo() != null ? receta.getStockMinimo() : 0)
                    .build();
            heladoService.save(helado);
        }

        return recetaMapper.toDto(saved);
    }

    private void resolverConversion(IngredienteReceta ing) {
        if (ing.getUnidadOriginal() == null || ing.getCantidadOriginal() <= 0) return;

        UnidadMedida unidadBase;

        if (ing.getProducto() != null && ing.getProducto().getId() != null) {
            unidadBase = productoRepository.findById(ing.getProducto().getId())
                    .map(p -> p.getUnidadMedida())
                    .orElse(ing.getUnidadOriginal());
        } else {
            unidadBase = UnidadMedida.LITRO;
        }

        try {
            double convertida = ConversionUtils.convertir(ing.getCantidadOriginal(), ing.getUnidadOriginal(), unidadBase);
            ing.setCantidad(convertida);
        } catch (IllegalArgumentException e) {
            ing.setCantidad(ing.getCantidadOriginal());
        }
    }

    @Transactional(readOnly = true)
    public RecetaDTO one(Long id) {
        RecetaDTO dto = recetaMapper.toDto(recetaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Receta", id)));
        enriquecerSubrecetaCostes(dto);
        return dto;
    }

    @Transactional
    public RecetaDTO replace(Long id, Receta receta) {
        recetaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Receta", id));
        receta.setId(id);
        if (receta.getIngredientes() != null) {
            receta.getIngredientes().forEach(ing -> {
                ing.setReceta(receta);
                resolverConversion(ing);
            });
        }
        Receta saved = recetaRepository.save(receta);
        persistirCoste(saved.getId());
        return recetaMapper.toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        heladoRepository.findByRecetaId(id).ifPresent(h -> heladoRepository.delete(h));
        recetaRepository.deleteById(id);
    }
}
