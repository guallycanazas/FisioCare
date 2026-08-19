package com.reservas.booking;

import com.reservas.booking.domain.BookingService;
import com.reservas.booking.domain.AppUser;
import com.reservas.booking.domain.Role;
import com.reservas.booking.repository.BookingServiceRepository;
import com.reservas.booking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedServices(BookingServiceRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new BookingService("Evaluación fisioterapéutica inicial", "Valoración funcional y plan personalizado de recuperación.", 60));
                repository.save(new BookingService("Terapia manual y movilidad", "Tratamiento manual, movilidad articular y ejercicios guiados.", 45));
                repository.save(new BookingService("Rehabilitación deportiva", "Trabajo progresivo para volver a entrenar con seguridad.", 60));
            } else {
                repository.findById(1L).ifPresent(service -> {
                    service.updateDetails(
                            "Evaluación fisioterapéutica inicial",
                            "Valoración funcional y plan personalizado de recuperación.",
                            60);
                    repository.save(service);
                });
                repository.findById(2L).ifPresent(service -> {
                    service.updateDetails(
                            "Terapia manual y movilidad",
                            "Tratamiento manual, movilidad articular y ejercicios guiados.",
                            45);
                    repository.save(service);
                });
                if (repository.findAll().stream().noneMatch(service -> service.getName().equals("Rehabilitación deportiva"))) {
                    repository.save(new BookingService("Rehabilitación deportiva", "Trabajo progresivo para volver a entrenar con seguridad.", 60));
                }
            }
        };
    }

    @Bean
    CommandLineRunner seedUsers(UserRepository repository,
                                PasswordEncoder passwordEncoder,
                                @Value("${app.demo.admin-email:}") String adminEmail,
                                @Value("${app.demo.admin-password:}") String adminPassword,
                                @Value("${app.demo.customer-email:}") String customerEmail,
                                @Value("${app.demo.customer-password:}") String customerPassword) {
        return args -> {
            if (repository.count() == 0) {
                if (!adminEmail.isBlank() && !adminPassword.isBlank()) {
                    repository.save(new AppUser(
                            "Administrador",
                            adminEmail,
                            passwordEncoder.encode(adminPassword),
                            Role.ADMIN
                    ));
                }
                if (!customerEmail.isBlank() && !customerPassword.isBlank()) {
                    repository.save(new AppUser(
                            "Cliente demo",
                            customerEmail,
                            passwordEncoder.encode(customerPassword),
                            Role.CUSTOMER
                    ));
                }
            }
        };
    }
}
