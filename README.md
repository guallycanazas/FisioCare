# FisioCare - Centro de fisioterapia y rehabilitación

Sistema web de reservas de fisioterapia y rehabilitación, construido con Spring Boot, Angular, PostgreSQL, Docker y JWT.

## Flujo de la aplicación

- Landing pública con servicios, método de atención y llamadas a la acción.
- Páginas independientes para iniciar sesión, registrarse y reservar.
- Cuenta del paciente con próxima sesión, estadísticas, historial y cancelación inline.
- Panel administrativo con filtros por estado, búsqueda, confirmación, rechazo y eliminación sin ventanas emergentes.
- Registro e inicio de sesión de clientes.
- Autenticación JWT y contraseñas protegidas con BCrypt.
- Roles `ADMIN` y `CUSTOMER`.
- Catálogo de servicios reservables.
- Creación, historial y cancelación de reservas.
- Reprogramación de reservas mediante `PUT`.
- Confirmación, rechazo y consulta global para administradores.
- Edición de servicios mediante `PUT` desde el catálogo administrativo.
- Control de disponibilidad básica por servicio y horario.
- API REST en Spring Boot.
- Interfaz Angular servida por Nginx.
- PostgreSQL ejecutado con Docker Compose.

## Rutas principales

- `/` — Landing pública.
- `/reservar` — Flujo de reserva paso a paso.
- `/login` y `/registro` — Acceso seguro en páginas propias.
- `/mi-cuenta` — Panel del paciente.
- `/admin` — Agenda y catálogo del administrador.

## Google OAuth2 opcional

El login tradicional con JWT continúa disponible. Para activar el botón `Continuar con Google`, copia `.env.example` como `.env`, completa las credenciales de Google y cambia `GOOGLE_OAUTH_ENABLED` a `true`:

```env
GOOGLE_OAUTH_ENABLED=true
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

En Google Cloud Console registra esta URL de redirección para desarrollo:
`http://localhost:8081/login/oauth2/code/google`

Después ejecuta `docker compose up -d --build`. Spring Security usa el cliente OAuth2/OIDC de Google y, al volver a FisioCare, la aplicación emite su JWT interno para proteger la API.

## Ejecutar todo con Docker

```bash
docker compose up --build
```

La aplicación queda disponible en `http://localhost:4200` y la API en `http://localhost:8081`.

## Usuarios demo

- Administrador: `admin@reservas.local` / `Admin123!`
- Cliente: `cliente@reservas.local` / `Cliente123!`

## Ejecutar solo el backend en local

Requisitos: Java 17 y Maven.

```bash
cd backend
mvn spring-boot:run
```

Antes, inicia PostgreSQL con `docker compose up -d db`. La API queda disponible en `http://localhost:8080` cuando se ejecuta fuera de Docker.

## Endpoints iniciales

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/providers`
- `GET /api/auth/me`
- `GET /api/services`
- `POST /api/services` (administrador)
- `PUT /api/services/{id}` (administrador)
- `DELETE /api/services/{id}` (administrador)
- `GET /api/reservations/mine` (cliente)
- `GET /api/reservations` (administrador)
- `POST /api/reservations` (cliente)
- `PUT /api/reservations/{id}` (administrador)
- `PATCH /api/reservations/{id}/cancel` (cliente propietario)
- `PATCH /api/reservations/{id}/status` (administrador)
- `DELETE /api/reservations/{id}` (administrador)

## Pruebas

Las pruebas de persistencia cubren insertar, listar, actualizar estado, reprogramar y eliminar reservas:

```bash
cd backend
mvn test
```

## Despliegue cloud

El proyecto está preparado para cualquier plataforma que ejecute Docker Compose o imágenes Docker. En producción se deben cambiar `JWT_SECRET`, `DB_PASSWORD` y `DB_URL` por variables de entorno seguras, usar una base de datos administrada y activar HTTPS.
