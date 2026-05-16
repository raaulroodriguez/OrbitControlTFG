package rra.orbitcontrol.services;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rra.orbitcontrol.config.PushNotificationService;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.exceptions.InsufficientStockException;
import rra.orbitcontrol.mappers.HeladoElaboradoMapper;
import rra.orbitcontrol.models.dtos.requests.ConsumirRequest;
import rra.orbitcontrol.models.dtos.responses.EventoHeladoDTO;
import rra.orbitcontrol.models.dtos.requests.ElaborarRequest;
import rra.orbitcontrol.models.dtos.responses.HeladoElaboradoDTO;
import rra.orbitcontrol.models.enums.EstadoProducto;
import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.models.entities.Helado;
import rra.orbitcontrol.models.entities.HeladoElaborado;
import rra.orbitcontrol.repositories.HeladoElaboradoRepository;
import rra.orbitcontrol.repositories.HeladoRepository;
import rra.orbitcontrol.repositories.RecetaRepository;
import rra.orbitcontrol.repositories.ProductoRepository;
import rra.orbitcontrol.models.entities.Receta;
import rra.orbitcontrol.models.entities.IngredienteReceta;
import rra.orbitcontrol.models.entities.Producto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class HeladoElaboradoService {

    private final HeladoElaboradoRepository heladoElaboradoRepository;
    private final HeladoElaboradoMapper     heladoElaboradoMapper;
    private final HeladoRepository          heladoRepository;
    private final RecetaRepository          recetaRepository;
    private final ProductoRepository        productoRepository;
    private final PushNotificationService pushNotificationService;

    public HeladoElaboradoService(HeladoElaboradoRepository heladoElaboradoRepository,
                                    HeladoElaboradoMapper heladoElaboradoMapper,
                                    HeladoRepository heladoRepository,
                                    RecetaRepository recetaRepository,
                                    ProductoRepository productoRepository,
                                    PushNotificationService pushNotificationService) {
        this.heladoElaboradoRepository = heladoElaboradoRepository;
        this.heladoElaboradoMapper     = heladoElaboradoMapper;
        this.heladoRepository          = heladoRepository;
        this.recetaRepository          = recetaRepository;
        this.productoRepository        = productoRepository;
        this.pushNotificationService   = pushNotificationService;
    }

    @Transactional(readOnly = true)
    public List<HeladoElaboradoDTO> all() {
        return heladoElaboradoMapper.toDtoList(heladoElaboradoRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<HeladoElaboradoDTO> recientes() {
        return heladoElaboradoMapper.toDtoList(
                heladoElaboradoRepository.findTop10ByOrderByFechaElaboracionDesc());
    }

    @Transactional(readOnly = true)
    public List<HeladoElaboradoDTO> consumidos() {
        return heladoElaboradoMapper.toDtoList(
                heladoElaboradoRepository.findTop10ByEstadoOrderByFechaElaboracionDesc(EstadoProducto.CONSUMIDO));
    }

    @Transactional(readOnly = true)
    public HeladoElaboradoDTO one(Long id) {
        return heladoElaboradoMapper.toDto(heladoElaboradoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("HeladoElaborado", id)));
    }

    @Transactional
    public HeladoElaboradoDTO replace(Long id, HeladoElaborado heladoElaborado) {
        return heladoElaboradoRepository.findById(id)
                .map(h -> {
                    heladoElaborado.setId(h.getId());
                    return heladoElaboradoMapper.toDto(heladoElaboradoRepository.save(heladoElaborado));
                })
                .orElseThrow(() -> new EntityNotFoundException("HeladoElaborado", id));
    }

    @Transactional
    public List<HeladoElaboradoDTO> consumir(ConsumirRequest req) {
        Helado helado = heladoRepository.findById(req.getHeladoId())
                .orElseThrow(() -> new EntityNotFoundException("Helado", req.getHeladoId()));

        List<HeladoElaborado> disponibles = heladoElaboradoRepository
                .findByHeladoIdAndEstadoOrderByFechaElaboracionAsc(req.getHeladoId(), EstadoProducto.ALMACEN);

        if (disponibles.size() < req.getCantidad())
            throw new InsufficientStockException(helado.getNombre(), req.getCantidad(), disponibles.size());

        List<HeladoElaborado> consumidos = disponibles.stream()
                .limit(req.getCantidad())
                .peek(he -> he.setEstado(EstadoProducto.CONSUMIDO))
                .map(heladoElaboradoRepository::save)
                .toList();

        helado.setStockActual(helado.getStockActual() - req.getCantidad());
        heladoRepository.save(helado);
        comprobarStockMinimoHelado(helado);

        return heladoElaboradoMapper.toDtoList(consumidos);
    }

    @Transactional
    public void delete(Long id) {
        heladoElaboradoRepository.deleteById(id);
    }

    @Transactional
    public List<HeladoElaboradoDTO> elaborar(ElaborarRequest req) {
        Helado helado = heladoRepository.findById(req.getHeladoId())
                .orElseThrow(() -> new EntityNotFoundException("Helado", req.getHeladoId()));

        Receta receta = recetaRepository.findByIdWithAll(helado.getReceta().getId())
                .orElseThrow(() -> new EntityNotFoundException("Receta", helado.getReceta().getId()));

        int cantidad = req.getCantidad();

        validarStock(receta, cantidad);
        descontarIngredientes(receta, cantidad);

        LocalDateTime ahora = LocalDateTime.now();
        List<HeladoElaborado> creados = new ArrayList<>();

        for (int i = 0; i < cantidad; i++) {
            HeladoElaborado he = HeladoElaborado.builder()
                    .helado(helado)
                    .codigoProd(generarCodigo(helado, ahora, i))
                    .fechaElaboracion(ahora)
                    .estado(EstadoProducto.ALMACEN)
                    .build();
            creados.add(heladoElaboradoRepository.save(he));
        }

        helado.setStockActual(helado.getStockActual() + cantidad);
        heladoRepository.save(helado);

        return heladoElaboradoMapper.toDtoList(creados);
    }

    private void validarStock(Receta receta, int cantidadHelados) {
        for (IngredienteReceta ing : receta.getIngredientes()) {
            if (ing.getProducto() != null) {
                Producto p = productoRepository.findById(ing.getProducto().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto", ing.getProducto().getId()));
                double necesario = ing.getCantidad() * cantidadHelados;
                if (p.getStockActual() < necesario) {
                    throw new InsufficientStockException(
                            p.getNombre(), necesario, p.getStockActual(), p.getUnidadMedida().name());
                }
            } else if (ing.getSubreceta() != null) {
                recetaRepository.findByIdWithAll(ing.getSubreceta().getId()).ifPresent(sub -> {
                    double rendimiento = sub.getIngredientes().stream()
                            .filter(si -> si.getProducto() != null)
                            .mapToDouble(IngredienteReceta::getCantidad).sum();
                    if (rendimiento > 0) {
                        double fraccion = ing.getCantidad() / rendimiento;
                        validarStockSubreceta(sub, fraccion * cantidadHelados);
                    }
                });
            }
        }
    }

    private void validarStockSubreceta(Receta sub, double factor) {
        for (IngredienteReceta ing : sub.getIngredientes()) {
            if (ing.getProducto() != null) {
                Producto p = productoRepository.findById(ing.getProducto().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto", ing.getProducto().getId()));
                double necesario = ing.getCantidad() * factor;
                if (p.getStockActual() < necesario) {
                    throw new InsufficientStockException(
                            p.getNombre() + " (subreceta)", necesario, p.getStockActual(), p.getUnidadMedida().name());
                }
            }
        }
    }

    private void descontarIngredientes(Receta receta, int cantidadHelados) {
        for (IngredienteReceta ing : receta.getIngredientes()) {
            if (ing.getProducto() != null) {
                Producto p = productoRepository.findById(ing.getProducto().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto", ing.getProducto().getId()));
                p.setStockActual(p.getStockActual() - ing.getCantidad() * cantidadHelados);
                productoRepository.save(p);
            } else if (ing.getSubreceta() != null) {
                recetaRepository.findByIdWithAll(ing.getSubreceta().getId()).ifPresent(sub -> {
                    double rendimiento = sub.getIngredientes().stream()
                            .filter(si -> si.getProducto() != null)
                            .mapToDouble(IngredienteReceta::getCantidad).sum();
                    if (rendimiento > 0) {
                        double fraccion = ing.getCantidad() / rendimiento;
                        descontarIngredientesSubreceta(sub, fraccion * cantidadHelados);
                    }
                });
            }
        }
    }

    private void descontarIngredientesSubreceta(Receta sub, double factor) {
        for (IngredienteReceta ing : sub.getIngredientes()) {
            if (ing.getProducto() != null) {
                Producto p = productoRepository.findById(ing.getProducto().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto", ing.getProducto().getId()));
                p.setStockActual(p.getStockActual() - ing.getCantidad() * factor);
                productoRepository.save(p);
            }
        }
    }

    @Transactional
    public HeladoElaboradoDTO crear(HeladoElaborado helado) {
        LocalDateTime ahora = LocalDateTime.now();
        String codigo = generarCodigo(helado.getHelado(), ahora, 0);
        helado.setCodigoProd(codigo);
        helado.setFechaElaboracion(ahora);
        helado.setEstado(EstadoProducto.ALMACEN);
        return heladoElaboradoMapper.toDto(heladoElaboradoRepository.save(helado));
    }

    @Transactional(readOnly = true)
    public List<EventoHeladoDTO> recientesAgrupados() {
        return heladoElaboradoRepository
                .findRecientesAgrupados(PageRequest.of(0, 5))
                .stream()
                .map(row -> new EventoHeladoDTO(
                        (Long)          row[0],
                        (String)        row[1],
                        row[2].toString(),
                        (Long)          row[3],
                        (LocalDateTime) row[4],
                        ((Number)       row[5]).longValue()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventoHeladoDTO> consumidosAgrupados() {
        return heladoElaboradoRepository
                .findConsumidosAgrupados(EstadoProducto.CONSUMIDO, PageRequest.of(0, 5))
                .stream()
                .map(row -> new EventoHeladoDTO(
                        (Long)          row[0],
                        (String)        row[1],
                        row[2].toString(),
                        (Long)          row[3],
                        (LocalDateTime) row[4],
                        ((Number)       row[5]).longValue()
                ))
                .toList();
    }

    private String generarCodigo(Helado helado, LocalDateTime fechaRef, int offset) {
        if (helado == null) throw new IllegalArgumentException("El helado no puede ser nulo");

        String tipo = helado.getTipo().name().substring(0, Math.min(helado.getTipo().name().length(), 3)).toUpperCase();
        String nombreSabor = helado.getNombre() != null ? helado.getNombre() : "XXXX";
        String sabor = nombreSabor.substring(0, Math.min(nombreSabor.length(), 4)).toUpperCase();
        String fechaStr = fechaRef.format(DateTimeFormatter.ofPattern("yyMMdd"));

        long count = heladoElaboradoRepository.countByHeladoIdAndFechaElaboracionBetween(
                helado.getId(),
                fechaRef.toLocalDate().atStartOfDay(),
                fechaRef.toLocalDate().atTime(23, 59, 59)
        );

        String secuencia = String.format("%03d", count + 1 + offset);
        return tipo + "-" + sabor + "-" + fechaStr + "-" + secuencia;
    }

    private void comprobarStockMinimoHelado(Helado helado) {
        if (helado.getStockActual() <= helado.getStockMinimo()) {
            pushNotificationService.enviarARoles(
                List.of(RolNombre.HELADERO, RolNombre.ADMIN),
                "Stock bajo — " + helado.getTipo().name().charAt(0) + helado.getTipo().name().substring(1).toLowerCase() + " " + helado.getNombre(),
                "Quedan " + helado.getStockActual() + " unidades. Mínimo: " + helado.getStockMinimo(),
                "/obrador/alertas"
            );
        }
    }
}
