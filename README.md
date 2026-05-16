# OrbitControl 🍦

> **"Mantén tu negocio en órbita"**

Sistema SaaS de gestión integral para heladerías artesanales, desarrollado como Trabajo de Fin de Grado del ciclo **Técnico Superior en Desarrollo de Aplicaciones Web (DAW)** en el IES Belén de Málaga — curso 2025/2026.

**Autor:** Raúl Rodríguez Aponte

---

## ¿Qué es OrbitControl?

OrbitControl nace de la necesidad real de digitalizar la gestión de una heladería artesanal. La mayoría de estos negocios siguen usando hojas de cálculo, cuadernos en papel o herramientas genéricas que no están pensadas para este sector.

La aplicación centraliza en un único lugar todos los procesos operativos: el obrador, el almacén, los pedidos a proveedores, los turnos del personal y la gestión de usuarios. Al estar interconectados, una acción en un módulo repercute automáticamente en los demás — por ejemplo, registrar una producción en el obrador descuenta los ingredientes del almacén de forma automática.

Funciona como **SaaS**: el cliente accede desde cualquier navegador sin instalar nada, y está empaquetada como **PWA** para poder instalarla en cualquier dispositivo como si fuera una app nativa.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Angular (standalone components) | 21 |
| Estilos | Tailwind CSS | 4 |
| Backend | Spring Boot + Java | 3 / 21 LTS |
| Seguridad | Spring Security + JWT | — |
| Base de datos | MySQL | 8.0 |
| ORM | Spring Data JPA + Hibernate | — |
| Mapeo DTOs | MapStruct | — |
| Hosting frontend | Vercel (CDN global) | — |
| Hosting backend | Hetzner CX43 (Ubuntu 24.04) | — |
| Proxy | Nginx + SSL (Let's Encrypt) | — |
| CI/CD | GitHub Actions | — |

---

## Módulos

- **Almacén** — CRUD de productos con stock actual, mínimo, unidad de medida y proveedor. Búsqueda paginada, filtros por tipo y alertas automáticas cuando el stock baja del mínimo.
- **Proveedores** — Alta, edición y eliminación. Cada producto se asocia a su proveedor. Vista de detalle con sus productos.
- **Pedidos** — Crear pedidos a proveedores con estados `BORRADOR → PENDIENTE → RECIBIDO`. Plantillas reutilizables, cálculo de coste total en tiempo real e historial completo.
- **Obrador** — Elaboración de helados por lotes (BARQUETA / PALETA). Descuento automático de stock de ingredientes. Dashboard de movimientos agrupados por helado y fecha.
- **Recetas** — Gestión de recetas con ingredientes (productos o subrecetas). Coste calculado automáticamente según el precio de cada ingrediente. Rendimiento por kg/L.
- **Jornadas** — Fichaje por PIN o tarjeta NFC/RFID. Plantillas de turnos, historial de jornadas del personal y gestión de turnos.
- **Usuarios** — Alta con roles: `ADMIN`, `ENCARGADO`, `HELADERO`, `DEPENDIENTE`. Login por selector + PIN o tarjeta NFC. JWT con roles y claims personalizados.
- **Dashboard** — Cards con últimos movimientos del obrador, pedidos recientes y productos con stock crítico. Botón para enviar alertas push a encargados y administradores.

---

## Autenticación y roles

OrbitControl tiene dos métodos de acceso:

- **PIN numérico** — Acceso de solo lectura para cualquier rol. El admin con PIN también puede escribir.
- **Tarjeta NFC/RFID** — Acceso completo de escritura para cualquier rol. Diseñado para empleados del obrador que trabajan con las manos ocupadas.

Si un usuario con sesión PIN intenta realizar una acción de escritura, la aplicación muestra un modal para acercar la tarjeta NFC y escala los permisos sin cerrar la sesión.

| Rol | Nivel | Acceso |
|-----|-------|--------|
| ADMIN | 1 | Total — gestión de usuarios, configuración y todas las secciones |
| ENCARGADO | 2 | Pedidos, almacén, proveedores, obrador y jornadas |
| HELADERO | 3 | Obrador, recetas y consulta de stock |
| DEPENDIENTE | 3 | Consulta de stock y recepción de pedidos |

---

## Arquitectura

```
Navegador / PWA
      │
      ▼
Vercel CDN  (tfg.orbitcontrol.es)
Angular 21 — build estático
vercel.json: /api/* → api-tfg.orbitcontrol.es
      │
      ▼
Nginx (Hetzner CX43)
Reverse proxy + SSL (Let's Encrypt)
Puerto 443 → localhost:8085
      │
      ▼
Spring Boot  (perfil: tfg)
Puerto 8085 — API REST + JWT
      │
      ▼
MySQL 8.0 — orbitcontroltfgbd (15 tablas)
```

---

## Entornos

| Entorno | Frontend | API |
|---------|----------|-----|
| TFG | https://tfg.orbitcontrol.es | https://api-tfg.orbitcontrol.es |
| Dev | https://dev.orbitcontrol.es | https://api-dev.orbitcontrol.es |
| Local | http://localhost:4200 | http://localhost:8080 (perfil dev → BD remota) |

---

## Instalación en local

### Requisitos previos

- Java 21 (OpenJDK)
- Node.js 20+
- Maven
- Angular CLI 21

> **No hace falta MySQL en local.** El backend arranca con el perfil `dev` que conecta directamente a la base de datos remota.

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/raaulroodriguez/OrbitControlTFG.git
cd OrbitControlTFG

# Instalar dependencias del frontend
cd frontend && npm install && cd ..

# Arrancar frontend y backend simultáneamente
npm run dev
```

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Frontend + backend simultáneamente |
| `npm run front` | Solo el frontend en localhost:4200 |
| `npm run back` | Solo el backend en localhost:8080 |
| `npm run deploy:tfg` | Build + subida al servidor TFG |
| `npm run logs:tfg` | Logs en tiempo real del servidor TFG |

---

## Estructura del proyecto

```
OrbitControl/
├── frontend/                        # Angular 21
│   └── src/app/
│       ├── core/                    # Guards, interceptores, servicios base
│       ├── features/                # Módulos (almacén, pedidos, obrador…)
│       └── shared/                  # Componentes reutilizables
├── backend/                         # Spring Boot 3
│   └── src/main/java/rra/orbitcontrol/
│       ├── config/                  # SecurityConfig, JWT, CORS
│       ├── controllers/             # Endpoints REST
│       ├── services/                # Lógica de negocio
│       ├── repositories/            # Spring Data JPA
│       ├── models/
│       │   ├── entities/            # @Entity — tablas JPA
│       │   ├── dtos/                # Request / Response DTOs
│       │   └── enums/               # TipoProducto, RolNombre…
│       ├── mappers/                 # MapStruct entity ↔ DTO
│       └── exceptions/              # GlobalExceptionHandler
└── package.json                     # Scripts centralizados
```

---

IES Belén · Málaga · DAW 2025/2026
