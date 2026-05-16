package rra.orbitcontrol.services;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import rra.orbitcontrol.config.PushNotificationService;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.HeladoMapper;
import rra.orbitcontrol.models.dtos.responses.HeladoDTO;
import rra.orbitcontrol.models.entities.Helado;
import rra.orbitcontrol.models.entities.IngredienteReceta;
import rra.orbitcontrol.models.entities.Receta;
import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.models.enums.TipoHelado;
import rra.orbitcontrol.repositories.HeladoRepository;
import rra.orbitcontrol.repositories.RecetaRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HeladoService {

    private final HeladoRepository       heladoRepository;
    private final HeladoMapper           heladoMapper;
    private final RecetaRepository       recetaRepository;
    private final PushNotificationService pushNotificationService;

    public HeladoService(HeladoRepository heladoRepository, HeladoMapper heladoMapper,
                         RecetaRepository recetaRepository, PushNotificationService pushNotificationService) {
        this.heladoRepository       = heladoRepository;
        this.heladoMapper           = heladoMapper;
        this.recetaRepository       = recetaRepository;
        this.pushNotificationService = pushNotificationService;
    }

    public List<HeladoDTO> all() {
        return enriquecer(heladoRepository.findAll());
    }

    public Map<String, Object> allPaged(int pagina, int tamanio, String sortBy, String sortDir, String search, String filtro) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        PageRequest pageable = PageRequest.of(pagina, tamanio, sort);

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasfiltro = filtro != null && !filtro.isBlank();

        Page<Helado> page;
        if (hasfiltro) {
            TipoHelado tipo = TipoHelado.valueOf(filtro);
            page = hasSearch
                    ? heladoRepository.searchPagedByTipo(search, tipo, pageable)
                    : heladoRepository.searchByTipoPaged(tipo, pageable);
        } else {
            page = hasSearch
                    ? heladoRepository.searchPaged(search, pageable)
                    : heladoRepository.findAll(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("helados",     enriquecer(page.getContent()));
        response.put("currentPage", page.getNumber());
        response.put("totalPages",  page.getTotalPages());
        response.put("total",       page.getTotalElements());
        return response;
    }

    public Map<String, Object> stockBajo(int pagina, int tamanio) {
        PageRequest pageable = PageRequest.of(pagina, tamanio, Sort.by("stockActual").ascending());
        Page<Helado> page = heladoRepository.findStockBajo(pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("helados",   heladoMapper.toDtoList(page.getContent()));
        response.put("currentPage", page.getNumber());
        response.put("totalPages",  page.getTotalPages());
        response.put("total",       page.getTotalElements());
        return response;
    }

    public void enviarAlerta(Long id) {
        Helado h = heladoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Helado", id));
        String tipo = h.getTipo().name().charAt(0) + h.getTipo().name().substring(1).toLowerCase();
        pushNotificationService.enviarARoles(
            List.of(RolNombre.HELADERO, RolNombre.ADMIN),
            "Stock bajo — " + tipo + " " + h.getNombre(),
            "Quedan " + h.getStockActual() + " unidades. Mínimo: " + h.getStockMinimo(),
            "/obrador/alertas"
        );
    }

    public void enviarTodasAlertas() {
        PageRequest pageable = PageRequest.of(0, 100, Sort.by("stockActual").ascending());
        heladoRepository.findStockBajo(pageable).getContent().forEach(h -> {
            String tipo = h.getTipo().name().charAt(0) + h.getTipo().name().substring(1).toLowerCase();
            pushNotificationService.enviarARoles(
                List.of(RolNombre.HELADERO, RolNombre.ADMIN),
                "Stock bajo — " + tipo + " " + h.getNombre(),
                "Quedan " + h.getStockActual() + " unidades. Mínimo: " + h.getStockMinimo(),
                "/obrador/alertas"
            );
        });
    }

    private List<HeladoDTO> enriquecer(List<Helado> helados) {
        helados.forEach(h -> {
            if (h.getReceta() != null && h.getReceta().getId() != null) {
                recetaRepository.findByIdWithAll(h.getReceta().getId())
                        .ifPresent(r -> h.setCosteProducion(calcularCoste(r)));
            }
        });
        return heladoMapper.toDtoList(helados);
    }

    public double calcularCoste(Receta receta) {
        if (receta == null || receta.getIngredientes() == null) return 0.0;

        double total = 0.0;
        for (IngredienteReceta ing : receta.getIngredientes()) {
            if (ing.getSubreceta() != null) {
                Receta subrecetaCompleta = recetaRepository.findByIdWithAll(ing.getSubreceta().getId())
                        .orElse(ing.getSubreceta());
                double costeTotalBase = calcularCoste(subrecetaCompleta);
                double rendimiento = subrecetaCompleta.getIngredientes().stream()
                        .filter(si -> si.getProducto() != null)
                        .mapToDouble(IngredienteReceta::getCantidad)
                        .sum();
                double costeUnitario = rendimiento > 0 ? costeTotalBase / rendimiento : 0;
                total += ing.getCantidad() * costeUnitario;
            } else if (ing.getProducto() != null && ing.getProducto().getPrecio() > 0) {
                double contenido = ing.getProducto().getContenidoPorUnidad();
                double precioPorUnidad = contenido > 0
                        ? ing.getProducto().getPrecio() / contenido
                        : ing.getProducto().getPrecio();
                total += ing.getCantidad() * precioPorUnidad;
            }
        }
        return Math.round(total * 100.0) / 100.0;
    }

    @Transactional
    public HeladoDTO save(Helado helado) {
        if (helado.getReceta() != null && helado.getReceta().getId() != null) {
            Receta recetaCompleta = recetaRepository.findByIdWithAll(helado.getReceta().getId())
                    .orElse(helado.getReceta());
            helado.setCosteProducion(calcularCoste(recetaCompleta));
        }
        return heladoMapper.toDto(heladoRepository.save(helado));
    }

    public HeladoDTO one(Long id) {
        return heladoMapper.toDto(heladoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Helado", id)));
    }

    @Transactional
    public HeladoDTO replace(Long id, Helado helado) {
        if (helado.getReceta() != null && helado.getReceta().getId() != null) {
            Receta recetaCompleta = recetaRepository.findByIdWithAll(helado.getReceta().getId())
                    .orElse(helado.getReceta());
            helado.setCosteProducion(calcularCoste(recetaCompleta));
        }
        return heladoRepository.findById(id)
                .map(h -> {
                    helado.setId(h.getId());
                    return heladoMapper.toDto(heladoRepository.save(helado));
                })
                .orElseThrow(() -> new EntityNotFoundException("Helado", id));
    }

    @Transactional
    public void delete(Long id) {
        if (!heladoRepository.existsById(id)) throw new EntityNotFoundException("Helado", id);
        heladoRepository.deleteById(id);
    }
}
