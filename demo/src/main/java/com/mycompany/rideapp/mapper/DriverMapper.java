
package com.mycompany.rideapp.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mycompany.rideapp.dto.request.DriverRequest;
import com.mycompany.rideapp.dto.response.DriverResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@Component
@RequiredArgsConstructor
public class DriverMapper {
    @Autowired
    private final UserMapper userMapper;

    public Driver toEntity(DriverRequest request, User user) {
        if (request == null)
            return null;
        return Driver.builder()
                .user(user)
                .licenseNumber(request.getLicenseNumber())
                .driverStatus(request.getDriverStatus())
                .address(request.getAddress())
                .avatarUrl(request.getAvatarUrl())
                .rating(0.0)
                .build();
    }

    public DriverResponse toResponse(Driver driver) {
        if (driver == null)
            return null;
        return DriverResponse.builder()
                .id(driver.getId())
                .user(driver.getUser() != null ? userMapper.toResponse(driver.getUser()) : null)
                .licenseNumber(driver.getLicenseNumber())
                .driverStatus(driver.getDriverStatus())
                .address(driver.getAddress())
                .avatarUrl(driver.getAvatarUrl())
                .rating(driver.getRating())
                .vehicleIds(driver.getVehicleRegister() != null
                        ? driver.getVehicleRegister().stream()
                                .map(vehicle -> vehicle.getId())
                                .collect(Collectors.toList())
                        : null)
                .build();
    }

    public static void updateEntity(Driver driver, DriverRequest request) {
        if (driver == null || request == null)
            return;
        if (request.getLicenseNumber() != null) {
            driver.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getDriverStatus() != null) {
            driver.setDriverStatus(request.getDriverStatus());
        }
        if (request.getAddress() != null) {
            driver.setAddress(request.getAddress());
        }
        if (request.getAvatarUrl() != null) {
            driver.setAvatarUrl(request.getAvatarUrl());
        }
    }
}
