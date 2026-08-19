package com.reservas.booking.web;

import com.reservas.booking.domain.BookingService;
import com.reservas.booking.repository.BookingServiceRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class BookingServiceController {

    private final BookingServiceRepository repository;

    public BookingServiceController(BookingServiceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<BookingService> findAll() {
        return repository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingService create(@Valid @RequestBody ServiceRequest request) {
        return repository.save(new BookingService(
                request.name(), request.description(), request.durationMinutes()));
    }

    @PutMapping("/{id}")
    public BookingService update(@PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        BookingService service = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
        service.updateDetails(request.name(), request.description(), request.durationMinutes());
        return repository.save(service);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    public record ServiceRequest(
            @NotBlank String name,
            String description,
            @Min(1) Integer durationMinutes
    ) {
    }
}
