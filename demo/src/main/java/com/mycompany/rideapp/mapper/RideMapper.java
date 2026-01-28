package com.mycompany.rideapp.mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mycompany.rideapp.dto.request.RideRequest;
import com.mycompany.rideapp.dto.response.RideResponse;
import com.mycompany.rideapp.dto.response.UserResponse;
import com.mycompany.rideapp.entity.Ride;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RideMapper {
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final com.mycompany.rideapp.repository.DriverRepository driverRepository;
    @Autowired
    private final DriverMapper driverMapper;
    @Autowired
    private final UserMapper userMapper;
    // private final ReviewMapper reviewMapper;
    // private final PaymentMapper paymentMapper;

    public Ride toEntity(RideRequest dto) {
        com.mycompany.rideapp.entity.Driver driver = driverRepository.findById(dto.getDriverId()).orElse(null);
        User customer = userRepository.findById(dto.getCustomerId()).orElse(null);

        java.sql.Date rideDate = null;
        if (dto.getRideDate() != null && !dto.getRideDate().isEmpty()) {
            try {
                rideDate = java.sql.Date.valueOf(dto.getRideDate());
            } catch (IllegalArgumentException e) {
                // If parsing fails, use current date
                rideDate = new java.sql.Date(System.currentTimeMillis());
            }
        }

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
                .rideDate(rideDate)
                .build();
    }

    public RideResponse toResponse(Ride entity) {
        com.mycompany.rideapp.dto.response.DriverResponse driver = entity.getDriver() != null
                ? driverMapper.toResponse(entity.getDriver())
                : null;
        UserResponse customer = entity.getCustomer() != null ? userMapper.toResponse(entity.getCustomer()) : null;

        // Get driver's current location
        Double driverLat = entity.getDriver() != null ? entity.getDriver().getLatitude() : null;
        Double driverLng = entity.getDriver() != null ? entity.getDriver().getLongitude() : null;

        String rideDate = entity.getRideDate() != null ? entity.getRideDate().toString() : null;

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
                .rideDate(rideDate)
                .build();
    }
}