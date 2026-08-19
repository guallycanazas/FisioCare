package com.reservas.booking.repository;

import com.reservas.booking.domain.BookingService;
import com.reservas.booking.domain.BookingStatus;
import com.reservas.booking.domain.Reservation;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ReservationRepositoryDataTest {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookingServiceRepository serviceRepository;

    @Test
    void insertaYListaReservasPersistidas() {
        BookingService service = serviceRepository.save(
                new BookingService("Evaluación inicial", "Valoración", 60));
        reservationRepository.save(new Reservation(
                "Ana Pérez", "ana@example.com", futureDate(), service));

        assertThat(reservationRepository.findAll()).hasSize(1);
        assertThat(reservationRepository.findAll().get(0).getCustomerEmail())
                .isEqualTo("ana@example.com");
    }

    @Test
    void actualizaElEstadoDeUnaReserva() {
        BookingService service = serviceRepository.save(
                new BookingService("Terapia manual", "Movilidad", 45));
        Reservation reservation = reservationRepository.save(new Reservation(
                "Luis Pérez", "luis@example.com", futureDate(), service));

        reservation.changeStatus(BookingStatus.CONFIRMED);
        reservationRepository.save(reservation);

        assertThat(reservationRepository.findById(reservation.getId()))
                .get().extracting(Reservation::getStatus)
                .isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void eliminaUnaReserva() {
        BookingService service = serviceRepository.save(
                new BookingService("Rehabilitación", "Ejercicios", 60));
        Reservation reservation = reservationRepository.save(new Reservation(
                "Marta Díaz", "marta@example.com", futureDate(), service));

        reservationRepository.deleteById(reservation.getId());

        assertThat(reservationRepository.existsById(reservation.getId())).isFalse();
    }

    @Test
    void actualizaLaFechaYElServicioDeUnaReserva() {
        BookingService initial = serviceRepository.save(
                new BookingService("Consulta", "Inicial", 30));
        BookingService updated = serviceRepository.save(
                new BookingService("Deportiva", "Retorno", 60));
        Reservation reservation = reservationRepository.save(new Reservation(
                "Carlos Ruiz", "carlos@example.com", futureDate(), initial));
        LocalDateTime newDate = LocalDateTime.now().plusDays(3).withSecond(0).withNano(0);

        reservation.reschedule(newDate, updated);
        reservationRepository.save(reservation);

        Reservation stored = reservationRepository.findById(reservation.getId()).orElseThrow();
        assertThat(stored.getStartsAt()).isEqualTo(newDate);
        assertThat(stored.getService().getName()).isEqualTo("Deportiva");
    }

    private LocalDateTime futureDate() {
        return LocalDateTime.now().plusDays(2).withSecond(0).withNano(0);
    }
}
