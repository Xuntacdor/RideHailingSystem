package com.mycompany.rideapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.rideapp.dto.request.BookingTypeRequest;
import com.mycompany.rideapp.dto.response.BookingTypeResponse;
import com.mycompany.rideapp.enums.VehicleType;
import com.mycompany.rideapp.service.BookingTypeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/booking-types")
@RequiredArgsConstructor
public class BookingTypeController {

    private final BookingTypeService bookingTypeService;

    @PostMapping
    public ResponseEntity<BookingTypeResponse> createBookingType(@Valid @RequestBody BookingTypeRequest request) {
        BookingTypeResponse response = bookingTypeService.createBookingType(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingTypeResponse> getBookingTypeById(@PathVariable String id) {
        BookingTypeResponse response = bookingTypeService.getBookingTypeById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingTypeResponse>> getAllBookingTypes() {
        List<BookingTypeResponse> responses = bookingTypeService.getAllBookingTypes();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/active")
    public ResponseEntity<List<BookingTypeResponse>> getActiveBookingTypes() {
        List<BookingTypeResponse> responses = bookingTypeService.getActiveBookingTypes();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/vehicle/{type}")
    public ResponseEntity<List<BookingTypeResponse>> getBookingTypesByVehicleType(@PathVariable VehicleType type) {
        List<BookingTypeResponse> responses = bookingTypeService.getBookingTypesByVehicleType(type);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingTypeResponse> updateBookingType(
            @PathVariable String id,
            @Valid @RequestBody BookingTypeRequest request) {
        BookingTypeResponse response = bookingTypeService.updateBookingType(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookingType(@PathVariable String id) {
        bookingTypeService.deleteBookingType(id);
        return ResponseEntity.noContent().build();
    }
}
