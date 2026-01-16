
package com.example.demo.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.demo.dto.request.DriverRequest;
import com.example.demo.dto.response.DriverResponse;
import com.example.demo.entity.Driver;
import com.example.demo.entity.User;

@Component
public class DriverMapper {

    public static Driver toEntity(DriverRequest request, User user) {
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

    public static DriverResponse toResponse(Driver driver) {
        if (driver == null)
            return null;
        return DriverResponse.builder()
                .id(driver.getId())
                .userId(driver.getUser() != null ? driver.getUser().getId() : null)
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
