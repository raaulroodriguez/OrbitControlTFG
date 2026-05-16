<h1 align="center">
  <br>
  🌐 OrbitControl
  <br>
</h1>

<p align="center">
  Sistema de gestión integral para negocios y obradores
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.4.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/H2-Database-darkblue?style=for-the-badge&logo=h2&logoColor=white" alt="H2" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/estado-en%20desarrollo-yellow?style=for-the-badge" alt="Estado" />
  <img src="https://img.shields.io/badge/licencia-MIT-blue?style=for-the-badge" alt="Licencia" />
</p>

---

## 📋 Descripción

**OrbitControl** es una aplicación web full-stack para la gestión integral de negocios con obrador.
Permite controlar el inventario, la producción, los pedidos a proveedores y la gestión de usuarios desde una interfaz moderna y responsive.

---

## 🚀 Tecnologías

<table>
<tr>
<td valign="top" width="50%">

### ☕ Backend
| Tecnología | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 3.4.2 |
| Spring Security + JWT | JJWT 0.12.5 |
| Spring Data JPA | — |
| Lombok | — |
| MapStruct | 1.6.3 |
| MySQL | 8.0+ |
| Maven | — |

</td>
<td valign="top" width="50%">

### 🅰️ Frontend
| Tecnología | Versión |
|---|---|
| Angular | 21.1.0 |
| TailwindCSS | 4.x |
| TypeScript | 5.9.2 |
| RxJS | 7.8.0 |
| Angular SSR | — |

</td>
</tr>
</table>

---

## 📁 Estructura del proyecto

```
OrbitControl/
├── backend/                        # Spring Boot API REST
│   └── src/main/java/rra/orbitcontrol/
│       ├── config/                 # SecurityConfig, CORS, JWT, DataInitializer
│       ├── controllers/            # Endpoints REST
│       ├── models/
│       │   ├── entities/           # Pedido, Usuario, Proveedor, Producto...
│       │   ├── dtos/               # Data Transfer Objects
│       │   └── mappers/            # MapStruct mappers
│       ├── repositories/           # Spring Data JPA
│       └── services/               # Lógica de negocio
├── frontend/                       # Angular SPA
│   └── src/app/
│       ├── core/
│       │   ├── guards/             # Auth guard
│       │   ├── interceptors/       # JWT interceptor
│       │   ├── models/             # Interfaces TypeScript
│       │   └── services/           # HTTP services, AuthService, SidebarService
│       ├── features/               # Módulos por funcionalidad
│       │   ├── auth/               # Login
│       │   ├── dashboard/          # Página principal
│       │   ├── pedidos/
│       │   ├── proveedores/
│       │   ├── usuarios/
│       │   ├── helados/
│       │   └── productos/
│       └── shared/                 # Componentes reutilizables
│           ├── navbar/
│           ├── sidebar/
│           ├── footer/
│           ├── dashboard-card/
│           └── button/
└── pom.xml                         # POM raíz (multi-módulo)
```

---

## ⚙️ Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Java | 21 |
| Node.js | 18+ |
| npm | incluido con Node |
| MySQL | 8.0+ |
| Angular CLI | última estable |

```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli
```

---

## 🛠️ Instalación y arranque

### 1️⃣ Base de datos

```sql
CREATE DATABASE orbitcontrolbd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2️⃣ Variables de entorno

Crea el fichero `backend/src/main/resources/application-local.properties` *(excluido de git)*:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/orbitcontrolbd
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
jwt.secret=tu_secreto_base64
```

### 3️⃣ Backend

```bash
cd backend
./mvnw spring-boot:run
```

> 🟢 API disponible en `http://localhost:8080`
> Hibernate crea/actualiza las tablas automáticamente.
> El `DataInitializer` inserta datos de prueba si la BD está vacía.

### 4️⃣ Frontend

```bash
cd frontend
npm install
ng serve
```

> 🟢 App disponible en `http://localhost:4200`

---

## 👤 Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123!` | Administrador |
| `encargado` | `encargado1234` | Encargado |
| `dependiente` | `dependiente1234` | Dependiente |
| `heladero` | `heladero1234` | Heladero |

---

## 🔐 Roles y permisos

| Rol | Acceso |
|---|---|
| `ROLE_ADMIN` | Acceso total |
| `ROLE_ENCARGADO` | Pedidos, proveedores, inventario |
| `ROLE_DEPENDIENTE` | Consulta y registro de jornada |
| `ROLE_HELADERO` | Obrador y elaboración |

---

## ✨ Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 🔑 **Autenticación** | Login con JWT — tokens de 24 h de validez |
| 📊 **Dashboard** | Tarjetas de resumen con accesos rápidos por módulo |
| 📦 **Pedidos** | Seguimiento de estado y fechas de entrega a proveedores |
| 🗃️ **Inventario** | Gestión de materias primas y productos del almacén |
| 🧁 **Obrador** | Control de elaboraciones y consumo de ingredientes |
| 🏢 **Proveedores** | Ficha con historial de pedidos y compras |
| 👥 **Usuarios** | Gestión de roles y registro de jornada laboral |
| 📱 **Responsive** | Sidebar con menús desplegables adaptado a móvil y escritorio |
| 🛡️ **Seguridad** | Control de acceso por rol en frontend y backend |
