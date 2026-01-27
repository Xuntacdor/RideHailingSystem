
package com.mycompany.rideapp.mapper;

import org.springframework.stereotype.Component;

import com.mycompany.rideapp.dto.request.VehicleRegisterRequest;
import com.mycompany.rideapp.dto.response.VehicleRegisterResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.VehicleRegister;
import com.mycompany.rideapp.enums.VehicleStatus;

@Component
public class VehicleRegisterMapper {

    public static VehicleRegister toEntity(VehicleRegisterRequest request, Driver driver) {
        if (request == null)
            return null;
        return VehicleRegister.builder()
                .driver(driver)
                .vehicleType(request.getVehicleType())
                .vehicleNumber(request.getVehicleNumber())
                .vehicleBrand(request.getVehicleBrand())
                .vehicleColor(request.getVehicleColor())
                .licenseNumber(request.getLicenseNumber())
                .status(request.getStatus() != null ? request.getStatus() : VehicleStatus.ACTIVE)
                .imageUrl(request.getImageUrl())
                .build();
    }

    public static VehicleRegisterResponse toResponse(VehicleRegister vehicle) {
        if (vehicle == null)
            return null;
        return VehicleRegisterResponse.builder()
                .id(vehicle.getId())
                .driverId(vehicle.getDriver() != null ? vehicle.getDriver().getId() : null)
                .vehicleType(vehicle.getVehicleType())
                .vehicleNumber(vehicle.getVehicleNumber())
                .vehicleBrand(vehicle.getVehicleBrand())
                .vehicleColor(vehicle.getVehicleColor())
                .licenseNumber(vehicle.getLicenseNumber())
                .status(vehicle.getStatus())
                .imageUrl(vehicle.getImageUrl())
                .build();
    }

    public static void updateEntity(VehicleRegister vehicle, VehicleRegisterRequest request) {
        if (vehicle == null || request == null)
            return;
        if (request.getVehicleType() != null) {
            vehicle.setVehicleType(request.getVehicleType());
        }
        if (request.getVehicleNumber() != null) {
            vehicle.setVehicleNumber(request.getVehicleNumber());
        }
        if (request.getVehicleBrand() != null) {
            vehicle.setVehicleBrand(request.getVehicleBrand());
        }
        if (request.getVehicleColor() != null) {
            vehicle.setVehicleColor(request.getVehicleColor());
        }
        if (request.getLicenseNumber() != null) {
            vehicle.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }
        if (request.getImageUrl() != null) {
            vehicle.setImageUrl(request.getImageUrl());
        }
    }
}
