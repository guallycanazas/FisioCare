# Guion del video demo - FisioCare

Duración objetivo: 3 a 5 minutos.

## 1. Presentación del problema (0:00 - 0:30)

Mostrar la landing de FisioCare y explicar que el sistema centraliza la reserva de sesiones de fisioterapia, evitando mensajes dispersos y confirmaciones manuales.

## 2. Flujo del paciente (0:30 - 1:40)

1. Entrar a `http://localhost:4200`.
2. Mostrar servicios, propuesta de valor y botón **Reservar cita**.
3. Entrar a **Iniciar sesión** o seleccionar **Continuar con Google**.
4. Registrar una reserva indicando servicio, fecha y hora.
5. Mostrar **Mi cuenta**, el contador de reservas y el estado pendiente.

## 3. Flujo del administrador (1:40 - 3:00)

1. Salir y entrar con `admin@reservas.local` / `Admin123!`.
2. Mostrar el panel con filtros y búsqueda.
3. Confirmar una reserva pendiente.
4. Rechazar o cancelar otra reserva.
5. Eliminar una reserva con confirmación.
6. Editar un servicio del catálogo y guardar el cambio mediante `PUT`.

## 4. Evidencia técnica (3:00 - 4:20)

1. Mostrar `compose.yaml` y los tres contenedores: frontend, backend y PostgreSQL.
2. Mostrar los endpoints de `ReservationController` y `BookingServiceController`.
3. Mostrar `SecurityConfig`, `BCryptPasswordEncoder` y la configuración JWT/OAuth2.
4. Ejecutar `cd backend && mvn test` y mostrar que las pruebas de insertar, listar, actualizar y eliminar pasan.

## 5. Cierre (4:20 - 5:00)

Explicar que FisioCare cumple el CRUD REST, persiste información, protege el acceso y deja una base lista para desplegar con HTTPS y variables seguras.

## Evidencias que deben aparecer en pantalla

- Landing pública.
- Formulario de reserva.
- Mi cuenta del paciente.
- Panel administrador.
- Confirmación/rechazo/eliminación.
- Edición de servicio.
- `docker compose ps`.
- Resultado de `mvn test`.
