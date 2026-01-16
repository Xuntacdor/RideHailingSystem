package com.example.demo.mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.demo.dto.request.RideRequest;
import com.example.demo.dto.response.RideResponse;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.Ride;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RideMapper {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final UserMapper userMapper;
    // private final ReviewMapper reviewMapper;
    // private final PaymentMapper paymentMapper;

    public Ride toEntity(RideRequest dto) {
        User driver = userRepository.findById(dto.getDriverId()).orElse(null);
        User customer = userRepository.findById(dto.getCustomerId()).orElse(null);

        return Ride.builder()
                .driver(driver)
                .customer(customer)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .startLocation(dto.getStartLocation())
                .endLocation(dto.getEndLocation())
                .distance(dto.getDistance())
                .fare(dto.getFare())
                .status(dto.getStatus())
                .vehicleType(dto.getVehicleType())
                .build();
    }

    public RideResponse toResponse(Ride entity) {
        UserResponse driver = entity.getDriver() != null ? userMapper.toResponse(entity.getDriver()) : null;
        UserResponse customer = entity.getCustomer() != null ? userMapper.toResponse(entity.getCustomer()) : null;

        // List<com.example.demo.dto.response.ReviewResponse> reviews = null;
        // if (entity.getReviews() != null) {
        //     reviews = entity.getReviews().stream()
        //             .map(reviewMapper::toResponse)
        //             .collect(Collectors.toList());
        // }

        // List<com.example.demo.dto.response.PaymentResponse> payments = null;
        // if (entity.getPayments() != null) {
        //     payments = entity.getPayments().stream()
        //             .map(paymentMapper::toResponse)
        //             .collect(Collectors.toList());
        // }

        return RideResponse.builder()
                .id(entity.getId())
                .driver(driver)
                .customer(customer)
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .startLocation(entity.getStartLocation())
                .endLocation(entity.getEndLocation())
                .distance(entity.getDistance())
                .fare(entity.getFare())
                .status(entity.getStatus())
                .vehicleType(entity.getVehicleType())
                // .reviews(reviews)
                // .payments(payments)
                .build();
    }
}