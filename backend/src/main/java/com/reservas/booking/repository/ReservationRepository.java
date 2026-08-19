package com.reservas.booking.repository;

import com.reservas.booking.domain.Reservation;
import com.reservas.booking.domain.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByCustomerIdOrderByStartsAtDesc(Long customerId);
    boolean existsByServiceIdAndStartsAtAndStatusNot(Long serviceId, LocalDateTime startsAt, BookingStatus status);
    boolean existsByServiceIdAndStartsAtAndStatusNotAndIdNot(Long serviceId, LocalDateTime startsAt, BookingStatus status, Long id);
}
