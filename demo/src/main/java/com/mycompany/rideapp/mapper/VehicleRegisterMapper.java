
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
                .licensePlate(request.getLicensePlate())
                .vehicleBrand(request.getVehicleBrand())
                .vehicleColor(request.getVehicleColor())
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
                .licensePlate(vehicle.getLicensePlate())
                .vehicleBrand(vehicle.getVehicleBrand())
                .vehicleColor(vehicle.getVehicleColor())
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
        if (request.getLicensePlate() != null) {
            vehicle.setLicensePlate(request.getLicensePlate());
        }
        if (request.getVehicleBrand() != null) {
            vehicle.setVehicleBrand(request.getVehicleBrand());
        }
        if (request.getVehicleColor() != null) {
            vehicle.setVehicleColor(request.getVehicleColor());
        }
        if (request.getImageUrl() != null) {
            vehicle.setImageUrl(request.getImageUrl());
        }
    }
}
