package rra.orbitcontrol.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rra.orbitcontrol.exceptions.EntityNotFoundException;
import rra.orbitcontrol.mappers.PedidoMapper;
import rra.orbitcontrol.models.dtos.requests.NuevoPedidoRequest;
import rra.orbitcontrol.models.dtos.responses.PedidoDTO;
import rra.orbitcontrol.models.entities.*;
import rra.orbitcontrol.models.enums.EstadoPedido;
import rra.orbitcontrol.repositories.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    private final PedidoRepository     pedidoRepository;
    private final PedidoMapper         pedidoMapper;
    private final ProveedorRepository  proveedorRepository;
    private final ProductoRepository   productoRepository;
    private final UsuarioRepository    usuarioRepository;

    public PedidoService(PedidoRepository pedidoRepository,
                         PedidoMapper pedidoMapper,
                         ProveedorRepository proveedorRepository,
                         ProductoRepository productoRepository,
                         UsuarioRepository usuarioRepository) {
        this.pedidoRepository    = pedidoRepository;
        this.pedidoMapper        = pedidoMapper;
        this.proveedorRepository = proveedorRepository;
        this.productoRepository  = productoRepository;
        this.usuarioRepository   = usuarioRepository;
    }

    public List<PedidoDTO> all() {
        return pedidoMapper.toDtoList(
            pedidoRepository.findAll().stream()
                .filter(p -> p.getEstado() != EstadoPedido.BORRADOR)
                .collect(Collectors.toList())
        );
    }

    public List<PedidoDTO> borradores() {
        return pedidoMapper.toDtoList(
            pedidoRepository.findAll().stream()
                .filter(p -> p.getEstado() == EstadoPedido.BORRADOR)
                .collect(Collectors.toList())
        );
    }

    public PedidoDTO one(Long id) {
        return pedidoMapper.toDto(pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido", id)));
    }

    @Transactional
    public PedidoDTO replace(Long id, Pedido pedido) {
        return pedidoRepository.findById(id)
                .map(p -> {
                    pedido.setId(p.getId());
                    return pedidoMapper.toDto(pedidoRepository.save(pedido));
                })
                .orElseThrow(() -> new EntityNotFoundException("Pedido", id));
    }

    @Transactional
    public void delete(Long id) {
        if (!pedidoRepository.existsById(id)) throw new EntityNotFoundException("Pedido", id);
        pedidoRepository.deleteById(id);
    }

    @Transactional
    public PedidoDTO cambiarEstado(Long id, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido", id));
        pedido.setEstado(nuevoEstado);
        if (nuevoEstado == EstadoPedido.RECIBIDO && pedido.getFechaRecibido() == null) {
            pedido.setFechaRecibido(LocalDateTime.now());
        }
        return pedidoMapper.toDto(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDTO guardarBorrador(NuevoPedidoRequest request, String username) {
        Usuario solicitante = usuarioRepository.findByNombreUsuario(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario con username '" + username + "'"));

        Proveedor proveedor = proveedorRepository.findById(request.getProveedorId())
                .orElseThrow(() -> new EntityNotFoundException("Proveedor", request.getProveedorId()));

        Pedido pedido = new Pedido();
        pedido.setProveedor(proveedor);
        pedido.setSolicitante(solicitante);
        pedido.setTipoProductoPedido(proveedor.getTipoProducto());
        pedido.setFechaEntrega(request.getFechaEntrega());
        pedido.setObservaciones(request.getObservaciones());
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado(EstadoPedido.BORRADOR);

        if (request.getItems() != null) {
            List<ProductoPedido> items = request.getItems().stream()
                    .filter(ir -> ir.getProductoId() != null)
                    .map(itemReq -> {
                        Producto producto = productoRepository.findById(itemReq.getProductoId())
                                .orElseThrow(() -> new EntityNotFoundException("Producto", itemReq.getProductoId()));
                        ProductoPedido item = new ProductoPedido();
                        item.setPedido(pedido);
                        item.setProducto(producto);
                        item.setCantidadSolicitada(itemReq.getCantidadSolicitada() > 0 ? itemReq.getCantidadSolicitada() : 1);
                        item.setPrecio(itemReq.getPrecio());
                        return item;
                    })
                    .collect(Collectors.toList());
            pedido.setItems(items);
        }

        return pedidoMapper.toDto(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoDTO crear(NuevoPedidoRequest request, String username) {
        Usuario solicitante = usuarioRepository.findByNombreUsuario(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario con username '" + username + "'"));

        Proveedor proveedor = proveedorRepository.findById(request.getProveedorId())
                .orElseThrow(() -> new EntityNotFoundException("Proveedor", request.getProveedorId()));

        Pedido pedido = new Pedido();
        pedido.setProveedor(proveedor);
        pedido.setSolicitante(solicitante);
        pedido.setTipoProductoPedido(proveedor.getTipoProducto());
        pedido.setFechaEntrega(request.getFechaEntrega());
        pedido.setObservaciones(request.getObservaciones());

        if (request.getItems() != null) {
            List<ProductoPedido> items = request.getItems().stream()
                    .map(itemReq -> {
                        Producto producto = productoRepository.findById(itemReq.getProductoId())
                                .orElseThrow(() -> new EntityNotFoundException("Producto", itemReq.getProductoId()));
                        ProductoPedido item = new ProductoPedido();
                        item.setPedido(pedido);
                        item.setProducto(producto);
                        item.setCantidadSolicitada(itemReq.getCantidadSolicitada());
                        item.setPrecio(itemReq.getPrecio());
                        return item;
                    })
                    .collect(Collectors.toList());
            pedido.setItems(items);
        }

        LocalDateTime ahora = LocalDateTime.now();
        pedido.setCodigoPedido(generarCodigo(ahora, proveedor));
        pedido.setFechaPedido(ahora);
        pedido.setEstado(EstadoPedido.PENDIENTE);

        return pedidoMapper.toDto(pedidoRepository.save(pedido));
    }

    private String generarCodigo(LocalDateTime fecha, Proveedor proveedor) {
        String fechaStr    = fecha.format(java.time.format.DateTimeFormatter.ofPattern("yyMMdd"));
        long count         = pedidoRepository.countByFechaPedidoBetween(
                fecha.toLocalDate().atStartOfDay(),
                fecha.toLocalDate().atTime(23, 59, 59));
        String secuencia   = String.format("%03d", count + 1);
        String nombreProv  = proveedor.getNombre() != null ? proveedor.getNombre() : "###";
        String proveedorCod = nombreProv.length() >= 3
                ? nombreProv.substring(0, 3).toUpperCase()
                : String.format("%-3s", nombreProv).replace(' ', '#').toUpperCase();
        return "PED-" + proveedorCod + "-" + fechaStr + "-" + secuencia;
    }
}
