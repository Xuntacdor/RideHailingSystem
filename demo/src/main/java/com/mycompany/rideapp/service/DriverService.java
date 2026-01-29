
package com.mycompany.rideapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.mycompany.rideapp.dto.request.DriverRequest;
import com.mycompany.rideapp.dto.response.DriverResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.mapper.DriverMapper;
import com.mycompany.rideapp.repository.DriverRepository;
import com.mycompany.rideapp.repository.UserRepository;
import com.mycompany.rideapp.enums.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j

public class DriverService {
    DriverRepository driverRepository;
    UserRepository userRepository;
    ImageStorageService imageStorageService;
    DriverMapper driverMapper;
    NotificationService notificationService;

    
    public DriverResponse createDriver(DriverRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (driverRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Driver driver = driverMapper.toEntity(request, user);
        driverRepository.save(driver);

        log.info("Driver created successfully with ID: {}", driver.getId());
        return driverMapper.toResponse(driver);
    }

    public DriverResponse getDriverById(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        log.info("Getting driver by ID: {}", id);
        return driverMapper.toResponse(driver);
    }

    public DriverResponse getDriverByUserId(String userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        log.info("Getting driver by user ID: {}", userId);
        return driverMapper.toResponse(driver);
    }

    public DriverResponse updateDriver(String id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getLicenseNumber() != null &&
                !request.getLicenseNumber().equals(driver.getLicenseNumber())) {
            if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
        }

        DriverMapper.updateEntity(driver, request);
        driverRepository.save(driver);

        log.info("Driver updated successfully with ID: {}", driver.getId());
        return driverMapper.toResponse(driver);
    }

    public DriverResponse updateDriverStatus(String id, String status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        driver.setDriverStatus(AccountStatus.valueOf(status));
        driverRepository.save(driver);

        log.info("Driver status updated to {} for ID: {}", status, driver.getId());
        return driverMapper.toResponse(driver);
    }

    public DriverResponse uploadDriverAvatar(String id, MultipartFile file) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String path = imageStorageService.storeAvatar(id, file);
        driver.setAvatarUrl(path);
        driverRepository.save(driver);

        log.info("Driver avatar uploaded successfully for ID: {}", driver.getId());
        return driverMapper.toResponse(driver);
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<DriverResponse> getDriversByStatus(String status) {
        return driverRepository.findByDriverStatus(status).stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DriverResponse> getNearestDrivers(Double lat, Double lng, int limit,
            com.mycompany.rideapp.enums.VehicleType vehicleType) {
        List<Driver> drivers = driverRepository.findNearestDrivers(lat, lng,
                org.springframework.data.domain.PageRequest.of(0, limit * 3));
        return drivers.stream()
                .filter(driver -> hasVehicleType(driver, vehicleType))
                .limit(limit)
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    private boolean hasVehicleType(Driver driver, com.mycompany.rideapp.enums.VehicleType vehicleType) {
        if (driver.getVehicleRegister() == null || driver.getVehicleRegister().isEmpty()) {
            return false;
        }
        return driver.getVehicleRegister().stream()
                .anyMatch(vehicle -> vehicle.getVehicleType().equals(vehicleType.name()) &&
                        vehicle.getStatus() == com.mycompany.rideapp.enums.VehicleStatus.ACTIVE);
    }

    
    public void updateDriverPosition(String id, Double lat, Double lng) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        driver.setLatitude(lat);
        driver.setLongitude(lng);
        driverRepository.save(driver);
    }

    public void getDriverPosition(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        notificationService.notifyDriverPositionUpdate(id, driver.getLatitude(), driver.getLongitude());
    }



}
