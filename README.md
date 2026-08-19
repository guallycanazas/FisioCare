# FisioCare

Sistema web de reservas para un centro de fisioterapia y rehabilitación. Permite que los pacientes conozcan los servicios, creen una cuenta, reserven una sesión y consulten su historial. El personal administrativo gestiona la agenda, confirma o rechaza solicitudes y mantiene el catálogo de servicios.

![FisioCare](frontend/public/fisiocare-mark.svg)

## Stack tecnológico

| Capa | Tecnología | Uso en el proyecto |
| --- | --- | --- |
| Frontend | Angular + TypeScript | Landing, autenticación, reservas y paneles |
| Estilos | CSS responsive | Sistema visual, componentes y adaptación móvil |
| Backend | Spring Boot 3.3 + Java 17 | API REST y reglas de negocio |
| Seguridad | Spring Security, JWT y BCrypt | Sesiones, roles y protección de contraseñas |
| Identidad opcional | OAuth 2.0 / OpenID Connect con Google | Continuar con Google |
| Persistencia | Spring Data JPA + PostgreSQL | Usuarios, servicios y reservas |
| Contenedores | Docker Compose | Frontend, backend y base de datos |
| Servidor web | Nginx | Sirve Angular y enruta `/api` al backend |
| Automatización | GitHub Actions | Build del frontend y pruebas del backend |

## Funcionalidades

- Landing pública con identidad visual de FisioCare, servicios y llamados a la acción.
- Registro e inicio de sesión con JWT.
- Acceso opcional con Google OAuth 2.0/OIDC.
- Roles `CUSTOMER` y `ADMIN`.
- Reserva de sesiones con fecha, hora y servicio.
- Panel del paciente con próximas sesiones, historial y cancelación.
- Panel administrativo con búsqueda, filtros, confirmación, rechazo y eliminación.
- CRUD de servicios y reservas.
- Validación de disponibilidad básica.
- Diseño responsive para escritorio y móvil.

## Estructura

```text
.
├── frontend/       # Angular + Nginx
├── backend/        # Spring Boot + Java 17
├── compose.yaml    # Frontend, backend y PostgreSQL
├── .env.example    # Variables de configuración, sin secretos
└── .github/        # Integración continua
```

## Ejecutar con Docker

Requisitos: Docker Desktop.

```bash
cp .env.example .env
docker compose up -d --build
```

URLs locales:

- Aplicación: <http://localhost:4200>
- API: <http://localhost:8081>
- Salud de la API: <http://localhost:8081/api/health>

Para detener los contenedores:

```bash
docker compose down
```

La base de datos usa el volumen `postgres_data`, por lo que sus datos se conservan mientras no se elimine ese volumen.

## Variables de entorno

Completa `.env` solo en tu equipo. Nunca publiques ese archivo:

```env
GOOGLE_OAUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=http://localhost:4200
```

En un entorno público también deben configurarse un `JWT_SECRET` fuerte, una contraseña segura para PostgreSQL y la URL pública del frontend. Las credenciales privadas de demostración no se muestran en la interfaz ni en este README.

## Google OAuth 2.0

Para activar el botón **Continuar con Google**:

1. Crea un cliente OAuth de tipo aplicación web en Google Cloud.
2. Configura `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_OAUTH_ENABLED=true`.
3. Registra la URI de retorno correspondiente al entorno:

```text
http://localhost:8081/login/oauth2/code/google
```

En un túnel o dominio público, reemplaza el host por la URL pública. Por ejemplo:

```text
https://tu-dominio.com/login/oauth2/code/google
```

## API principal

| Método | Ruta | Acceso |
| --- | --- | --- |
| `GET` | `/api/health` | Público |
| `POST` | `/api/auth/register` | Público |
| `POST` | `/api/auth/login` | Público |
| `GET` | `/api/auth/providers` | Público |
| `GET` | `/api/services` | Público |
| `POST` | `/api/reservations` | Cliente autenticado |
| `GET` | `/api/reservations/mine` | Cliente autenticado |
| `PATCH` | `/api/reservations/{id}/cancel` | Cliente propietario |
| `GET` | `/api/reservations` | Administrador |
| `PATCH` | `/api/reservations/{id}/status` | Administrador |
| `PUT` | `/api/reservations/{id}` | Administrador |
| `DELETE` | `/api/reservations/{id}` | Administrador |
| `POST/PUT/DELETE` | `/api/services` | Administrador |

## Pruebas y build

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm ci
npm run build -- --configuration production
```

GitHub Actions ejecuta automáticamente estas validaciones en cada cambio de la rama `main`.

## Compartir temporalmente desde tu Mac

Con Docker levantado, puedes crear una URL pública temporal sin abrir puertos del router:

```bash
cloudflared tunnel --url http://localhost:4200
```

La URL solo funciona mientras Docker y el túnel estén activos. Para producción se recomienda desplegar el frontend, backend y PostgreSQL en servicios administrados, con HTTPS, variables secretas y un dominio propio.

## Repositorio

<https://github.com/guallycanazas/FisioCare>
