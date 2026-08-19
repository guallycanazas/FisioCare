package com.reservas.booking.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String customerName;

    @Email
    @NotBlank
    private String customerEmail;

    @Future
    @NotNull
    private LocalDateTime startsAt;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    @ManyToOne(optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private BookingService service;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private AppUser customer;

    protected Reservation() {
    }

    public Reservation(String customerName, String customerEmail,
                       LocalDateTime startsAt, BookingService service) {
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.startsAt = startsAt;
        this.service = service;
    }

    public Reservation(AppUser customer, LocalDateTime startsAt, BookingService service) {
        this.customer = customer;
        this.customerName = customer.getName();
        this.customerEmail = customer.getEmail();
        this.startsAt = startsAt;
        this.service = service;
    }

    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public BookingStatus getStatus() { return status; }
    public BookingService getService() { return service; }
    public AppUser getCustomer() { return customer; }

    public void changeStatus(BookingStatus status) {
        this.status = status;
    }

    public void reschedule(LocalDateTime startsAt, BookingService service) {
        this.startsAt = startsAt;
        this.service = service;
    }
}
