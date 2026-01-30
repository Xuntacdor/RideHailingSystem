
package com.mycompany.rideapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mycompany.rideapp.dto.request.VehicleRegisterRequest;
import com.mycompany.rideapp.dto.response.VehicleRegisterResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.VehicleRegister;
import com.mycompany.rideapp.enums.VehicleStatus;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.mapper.VehicleRegisterMapper;
import com.mycompany.rideapp.repository.DriverRepository;
import com.mycompany.rideapp.repository.VehicleRegisterRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VehicleRegisterService {
    VehicleRegisterRepository vehicleRegisterRepository;
    DriverRepository driverRepository;

    public VehicleRegisterResponse registerVehicle(String driverId, VehicleRegisterRequest request) {
        // Check if driver exists
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if vehicle number already exists
        if (vehicleRegisterRepository.findByLicensePlate(request.getLicensePlate()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        VehicleRegister vehicle = VehicleRegisterMapper.toEntity(request, driver);
        
        vehicle.setStatus(VehicleStatus.ACTIVE);
        vehicleRegisterRepository.save(vehicle);

        log.info("Vehicle registered successfully with ID: {}", vehicle.getId());
        return VehicleRegisterMapper.toResponse(vehicle);
    }

    public VehicleRegisterResponse getVehicleById(String id) {
        VehicleRegister vehicle = vehicleRegisterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return VehicleRegisterMapper.toResponse(vehicle);
    }

    public List<VehicleRegisterResponse> getVehiclesByDriverId(String driverId) {
        // Verify driver exists
        if (!driverRepository.existsById(driverId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return vehicleRegisterRepository.findByDriverId(driverId).stream()
                .map(VehicleRegisterMapper::toResponse)
                .collect(Collectors.toList());
    }

    public VehicleRegisterResponse updateVehicle(String id, VehicleRegisterRequest request) {
        VehicleRegister vehicle = vehicleRegisterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // If vehicle number is being changed, check if it already exists
        if (request.getLicensePlate() != null &&
                !request.getLicensePlate().equals(vehicle.getLicensePlate())) {
            if (vehicleRegisterRepository.findByLicensePlate(request.getLicensePlate()).isPresent()) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
        }

        VehicleRegisterMapper.updateEntity(vehicle, request);
        vehicleRegisterRepository.save(vehicle);

        log.info("Vehicle updated successfully with ID: {}", vehicle.getId());
        return VehicleRegisterMapper.toResponse(vehicle);
    }

    public VehicleRegisterResponse updateVehicleStatus(String id, VehicleStatus status) {
        VehicleRegister vehicle = vehicleRegisterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        vehicle.setStatus(status);
        vehicleRegisterRepository.save(vehicle);

        log.info("Vehicle status updated to {} for ID: {}", status, vehicle.getId());
        return VehicleRegisterMapper.toResponse(vehicle);
    }

    public void deleteVehicle(String id) {
        if (!vehicleRegisterRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        vehicleRegisterRepository.deleteById(id);
        log.info("Vehicle deleted successfully with ID: {}", id);
    }

    public List<VehicleRegisterResponse> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRegisterRepository.findByStatus(status).stream()
                .map(VehicleRegisterMapper::toResponse)
                .collect(Collectors.toList());
    }
}
