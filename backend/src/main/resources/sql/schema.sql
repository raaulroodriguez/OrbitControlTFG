-- =====================================================
-- ORBITCONTROL - Script de creación de base de datos
-- Base de datos: MySQL 8.0+
-- =====================================================

DROP DATABASE IF EXISTS orbitcontrolbd;
CREATE DATABASE orbitcontrolbd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE orbitcontrolbd;

-- =====================================================
-- TABLAS INDEPENDIENTES
-- =====================================================

CREATE TABLE unidades_medida (
    id_unidad BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

CREATE TABLE usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20) UNIQUE,
    fecha_alta DATETIME,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE usuarios_roles (
    id_usuarios_roles BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    rol ENUM('ADMIN', 'ENCARGADO', 'HELADERO', 'DEPENDIENTE') NOT NULL,
    id_asignado_por BIGINT,
    fecha_asignacion DATETIME,

    CONSTRAINT fk_usuarios_roles_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuarios_roles_asignado_por FOREIGN KEY (id_asignado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE proveedores (
    id_proveedor BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nif VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    direccion VARCHAR(255),
    tipo_producto ENUM('OBRADOR', 'TIENDA', 'AMBOS'),
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE productos (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_caducidad DATETIME,
    precio DOUBLE DEFAULT 0,
    id_unidad_medida BIGINT NOT NULL,
    stock_actual DOUBLE DEFAULT 0,
    stock_minimo DOUBLE DEFAULT 0,
    tipo_producto ENUM('OBRADOR', 'TIENDA', 'AMBOS'),
    id_proveedor BIGINT,

    CONSTRAINT fk_productos_unidad FOREIGN KEY (id_unidad_medida) REFERENCES unidades_medida(id_unidad),
    CONSTRAINT fk_productos_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
) ENGINE=InnoDB;

CREATE TABLE recetas (
    id_receta BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE ingredientes_receta (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_receta BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    cantidad DOUBLE NOT NULL,

    CONSTRAINT fk_ingredientes_receta FOREIGN KEY (id_receta) REFERENCES recetas(id_receta) ON DELETE CASCADE,
    CONSTRAINT fk_ingredientes_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

CREATE TABLE helados (
    id_helado BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('BARQUETA', 'PALETA'),
    id_receta BIGINT,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    coste_producion DOUBLE DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_helados_receta FOREIGN KEY (id_receta) REFERENCES recetas(id_receta)
) ENGINE=InnoDB;

CREATE TABLE helados_elaborados (
    id_helado_elaborado BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_helado BIGINT NOT NULL,
    codigo_prod VARCHAR(50) NOT NULL UNIQUE,
    fecha_elaboracion DATETIME,
    fecha_caducidad DATETIME,
    estado ENUM('ALMACEN', 'TIENDA', 'CONSUMIDO'),

    CONSTRAINT fk_helados_elaborados_helado FOREIGN KEY (id_helado) REFERENCES helados(id_helado)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
    id_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_pedido VARCHAR(50) UNIQUE,
    id_proveedor BIGINT NOT NULL,
    tipo_producto_pedido ENUM('OBRADOR', 'TIENDA', 'AMBOS'),
    fecha_pedido DATETIME,
    fecha_entrega DATETIME,
    estado ENUM('BORRADOR', 'PENDIENTE', 'RECIBIDO', 'PAGADO', 'CANCELADO'),
    id_usuario_solicitante BIGINT NOT NULL,
    id_recibido_por BIGINT,
    fecha_recibido DATETIME,
    observaciones VARCHAR(500),

    CONSTRAINT fk_pedidos_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    CONSTRAINT fk_pedidos_solicitante FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_pedidos_recibido_por FOREIGN KEY (id_recibido_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE items_pedido (
    id_item BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    id_producto BIGINT,
    cantidad_solicitada DOUBLE NOT NULL,
    precio DOUBLE DEFAULT 0,

    CONSTRAINT fk_items_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_items_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

CREATE TABLE lotes (
    id_lote          BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_entidad     VARCHAR(20)  NOT NULL,
    entidad_id       BIGINT       NOT NULL,
    cantidad         DOUBLE       NOT NULL DEFAULT 0,
    fecha_caducidad  DATETIME,
    fecha_entrada    DATETIME,
    pedido_id        BIGINT,
    observaciones    TEXT
) ENGINE=InnoDB;

CREATE TABLE dispositivo_token (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id     BIGINT NOT NULL,
    token          VARCHAR(512) NOT NULL,
    plataforma     ENUM('WEB', 'ANDROID', 'IOS'),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_dispositivo_token (token),
    CONSTRAINT fk_dispositivo_token_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

CREATE INDEX idx_usuarios_roles_usuario ON usuarios_roles(id_usuario);
CREATE INDEX idx_usuarios_roles_rol ON usuarios_roles(rol);

CREATE INDEX idx_proveedores_nif ON proveedores(nif);
CREATE INDEX idx_proveedores_activo ON proveedores(activo);

CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_tipo ON productos(tipo_producto);
CREATE INDEX idx_productos_proveedor ON productos(id_proveedor);

CREATE INDEX idx_recetas_activo ON recetas(activo);

CREATE INDEX idx_helados_nombre ON helados(nombre);
CREATE INDEX idx_helados_tipo ON helados(tipo);
CREATE INDEX idx_helados_activo ON helados(activo);

CREATE INDEX idx_helados_elaborados_codigo ON helados_elaborados(codigo_prod);
CREATE INDEX idx_helados_elaborados_estado ON helados_elaborados(estado);
CREATE INDEX idx_helados_elaborados_helado ON helados_elaborados(id_helado);

CREATE INDEX idx_pedidos_codigo ON pedidos(codigo_pedido);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_proveedor ON pedidos(id_proveedor);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_pedido);

CREATE INDEX idx_lotes_entidad ON lotes(tipo_entidad, entidad_id);
CREATE INDEX idx_lotes_pedido ON lotes(pedido_id);
CREATE INDEX idx_lotes_caducidad ON lotes(fecha_caducidad);

CREATE INDEX idx_dispositivo_token_usuario ON dispositivo_token(usuario_id);
CREATE INDEX idx_dispositivo_token_plataforma ON dispositivo_token(plataforma);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO unidades_medida (nombre, abreviatura) VALUES
    ('Kilogramo', 'kg'),
    ('Gramo', 'g'),
    ('Litro', 'L'),
    ('Mililitro', 'ml'),
    ('Unidad', 'ud'),
    ('Docena', 'doc');

-- Usuario administrador inicial (password: Admin123!)
INSERT INTO usuarios (nombre, apellidos, nombre_usuario, password, email, telefono, fecha_alta, activo) VALUES
    ('Administrador', 'Sistema', 'admin', '$2a$10$paiD3FcQbSKzapkh3jnUDOx/5vEtMk9bS9AIr.NV3rZyDLPQEqVU6', 'admin@orbitcontrol.com', '600000000', NOW(), TRUE);

INSERT INTO usuarios_roles (id_usuario, rol, fecha_asignacion) VALUES
    (1, 'ADMIN', NOW());
