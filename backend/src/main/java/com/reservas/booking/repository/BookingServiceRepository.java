package com.reservas.booking.repository;

import com.reservas.booking.domain.BookingService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingServiceRepository extends JpaRepository<BookingService, Long> {
}

