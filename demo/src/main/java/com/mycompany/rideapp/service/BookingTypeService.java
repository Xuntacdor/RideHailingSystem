package com.mycompany.rideapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mycompany.rideapp.dto.request.BookingTypeRequest;
import com.mycompany.rideapp.dto.response.BookingTypeResponse;
import com.mycompany.rideapp.entity.BookingType;
import com.mycompany.rideapp.enums.VehicleType;
import com.mycompany.rideapp.exception.ResourceNotFoundException;
import com.mycompany.rideapp.mapper.BookingTypeMapper;
import com.mycompany.rideapp.repository.BookingTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingTypeService {

    private final BookingTypeRepository bookingTypeRepository;
    private final BookingTypeMapper bookingTypeMapper;

    public BookingTypeResponse createBookingType(BookingTypeRequest request) {
        BookingType bookingType = bookingTypeMapper.toEntity(request);
        bookingType = bookingTypeRepository.save(bookingType);
        return bookingTypeMapper.toResponse(bookingType);
    }

    public BookingTypeResponse getBookingTypeById(String id) {
        BookingType bookingType = bookingTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingType not found with id: " + id));
        return bookingTypeMapper.toResponse(bookingType);
    }

    public List<BookingTypeResponse> getAllBookingTypes() {
        List<BookingType> bookingTypes = bookingTypeRepository.findAll();
        return bookingTypes.stream()
                .map(bookingTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingTypeResponse> getActiveBookingTypes() {
        List<BookingType> bookingTypes = bookingTypeRepository.findByActiveTrue();
        return bookingTypes.stream()
                .map(bookingTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingTypeResponse> getBookingTypesByVehicleType(VehicleType vehicleType) {
        List<BookingType> bookingTypes = bookingTypeRepository.findByVehicleType(vehicleType);
        return bookingTypes.stream()
                .map(bookingTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    public BookingTypeResponse updateBookingType(String id, BookingTypeRequest request) {
        BookingType existingBookingType = bookingTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingType not found with id: " + id));

        BookingType updatedBookingType = bookingTypeMapper.toEntity(request);
        updatedBookingType.setId(id);

        updatedBookingType = bookingTypeRepository.save(updatedBookingType);
        return bookingTypeMapper.toResponse(updatedBookingType);
    }

    public void deleteBookingType(String id) {
        BookingType bookingType = bookingTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingType not found with id: " + id));

        // Soft delete by setting active to false
        bookingType.setActive(false);
        bookingTypeRepository.save(bookingType);
    }
}
