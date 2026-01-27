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
    private final com.example.demo.repository.DriverRepository driverRepository;
    @Autowired
    private final DriverMapper driverMapper;
    @Autowired
    private final UserMapper userMapper;
    // private final ReviewMapper reviewMapper;
    // private final PaymentMapper paymentMapper;

    public Ride toEntity(RideRequest dto) {
        com.example.demo.entity.Driver driver = driverRepository.findById(dto.getDriverId()).orElse(null);
        User customer = userRepository.findById(dto.getCustomerId()).orElse(null);

        return Ride.builder()
                .driver(driver)
                .customer(customer)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .startLatitude(dto.getStartLatitude())
                .startLongitude(dto.getStartLongitude())
                .endLatitude(dto.getEndLatitude())
                .endLongitude(dto.getEndLongitude())
                .distance(dto.getDistance())
                .fare(dto.getFare())
                .status(dto.getStatus())
                .vehicleType(dto.getVehicleType())
                .build();
    }

    public RideResponse toResponse(Ride entity) {
        com.example.demo.dto.response.DriverResponse driver = entity.getDriver() != null
                ? driverMapper.toResponse(entity.getDriver())
                : null;
        UserResponse customer = entity.getCustomer() != null ? userMapper.toResponse(entity.getCustomer()) : null;

        // Get driver's current location
        Double driverLat = entity.getDriver() != null ? entity.getDriver().getLatitude() : null;
        Double driverLng = entity.getDriver() != null ? entity.getDriver().getLongitude() : null;

        return RideResponse.builder()
                .id(entity.getId())
                .driver(driver)
                .customer(customer)
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .startLatitude(entity.getStartLatitude())
                .startLongitude(entity.getStartLongitude())
                .endLatitude(entity.getEndLatitude())
                .endLongitude(entity.getEndLongitude())
                .driverLat(driverLat)
                .driverLng(driverLng)
                .distance(entity.getDistance())
                .fare(entity.getFare())
                .status(entity.getStatus())
                .vehicleType(entity.getVehicleType())
                .build();
    }
}