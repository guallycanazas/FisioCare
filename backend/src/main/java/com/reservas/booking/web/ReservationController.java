package com.reservas.booking.web;

import com.reservas.booking.domain.AppUser;
import com.reservas.booking.domain.BookingService;
import com.reservas.booking.domain.BookingStatus;
import com.reservas.booking.domain.Reservation;
import com.reservas.booking.repository.BookingServiceRepository;
import com.reservas.booking.repository.ReservationRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final BookingServiceRepository serviceRepository;

    public ReservationController(ReservationRepository reservationRepository,
                                 BookingServiceRepository serviceRepository) {
        this.reservationRepository = reservationRepository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReservationResponse> findAll() {
        return reservationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/mine")
    public List<ReservationResponse> findMine(Authentication authentication) {
        AppUser user = currentUser(authentication);
        return reservationRepository.findByCustomerIdOrderByStartsAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @GetMapping("/availability")
    public Map<String, Boolean> availability(
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startsAt) {
        boolean occupied = reservationRepository.existsByServiceIdAndStartsAtAndStatusNot(
                serviceId, startsAt, BookingStatus.CANCELLED);
        return Map.of("available", !occupied);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest request,
                                       Authentication authentication) {
        AppUser user = currentUser(authentication);
        BookingService service = serviceRepository.findById(request.serviceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));

        if (reservationRepository.existsByServiceIdAndStartsAtAndStatusNot(
                service.getId(), request.startsAt(), BookingStatus.CANCELLED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese horario ya está reservado");
        }

        return toResponse(reservationRepository.save(new Reservation(user, request.startsAt(), service)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservationResponse update(@PathVariable Long id,
                                      @Valid @RequestBody UpdateReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        BookingService service = serviceRepository.findById(request.serviceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));

        if (reservationRepository.existsByServiceIdAndStartsAtAndStatusNotAndIdNot(
                service.getId(), request.startsAt(), BookingStatus.CANCELLED, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese horario ya está reservado");
        }

        reservation.reschedule(request.startsAt(), service);
        return toResponse(reservationRepository.save(reservation));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservationResponse updateStatus(@PathVariable Long id,
                                             @Valid @RequestBody StatusRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        reservation.changeStatus(request.status());
        return toResponse(reservationRepository.save(reservation));
    }

    @PatchMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Long id, Authentication authentication) {
        AppUser user = currentUser(authentication);
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean isOwner = reservation.getCustomer() != null
                && reservation.getCustomer().getId().equals(user.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes cancelar esta reserva");
        }
        reservation.changeStatus(BookingStatus.CANCELLED);
        return toResponse(reservationRepository.save(reservation));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");
        }
        reservationRepository.deleteById(id);
    }

    private AppUser currentUser(Authentication authentication) {
        return (AppUser) authentication.getPrincipal();
    }

    private ReservationResponse toResponse(Reservation reservation) {
        BookingService service = reservation.getService();
        return new ReservationResponse(
                reservation.getId(),
                reservation.getCustomerName(),
                reservation.getCustomerEmail(),
                reservation.getStartsAt(),
                reservation.getStatus().name(),
                new ServiceResponse(service.getId(), service.getName(), service.getDurationMinutes())
        );
    }

    public record CreateReservationRequest(
            @NotNull @Future LocalDateTime startsAt,
            @NotNull Long serviceId
    ) {
    }

    public record UpdateReservationRequest(
            @NotNull @Future LocalDateTime startsAt,
            @NotNull Long serviceId
    ) {
    }

    public record StatusRequest(@NotNull BookingStatus status) {
    }

    public record ReservationResponse(
            Long id,
            String customerName,
            String customerEmail,
            LocalDateTime startsAt,
            String status,
            ServiceResponse service
    ) {
    }

    public record ServiceResponse(Long id, String name, Integer durationMinutes) {
    }
}
