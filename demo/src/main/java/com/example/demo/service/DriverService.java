
package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.request.DriverRequest;
import com.example.demo.dto.response.DriverResponse;
import com.example.demo.entity.Driver;
import com.example.demo.entity.User;
import com.example.demo.exception.AppException;
import com.example.demo.exception.ErrorCode;
import com.example.demo.mapper.DriverMapper;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

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

    public boolean isUserOwningDriverId(String username, String driverId) {
    Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new RuntimeException("Driver not found"));
    
    return driver.getUser().getUserName().equals(username);
}

    public DriverResponse getDriverById(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return driverMapper.toResponse(driver);
    }

    public DriverResponse getDriverByUserId(String userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
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

        driver.setDriverStatus(status);
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

    public List<DriverResponse> getNearestDrivers(Double lat, Double lng, int limit,
            com.example.demo.enums.VehicleType vehicleType) {
        // Fetch more drivers to account for filtering by vehicle type
        List<Driver> drivers = driverRepository.findNearestDrivers(lat, lng,
                org.springframework.data.domain.PageRequest.of(0, limit * 3));

        return drivers.stream()
                .filter(driver -> hasVehicleType(driver, vehicleType))
                .limit(limit)
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    private boolean hasVehicleType(Driver driver, com.example.demo.enums.VehicleType vehicleType) {
        if (driver.getVehicleRegister() == null || driver.getVehicleRegister().isEmpty()) {
            return false;
        }
        return driver.getVehicleRegister().stream()
                .anyMatch(vehicle -> vehicle.getVehicleType().equals(vehicleType.name()) &&
                        vehicle.getStatus() == com.example.demo.enums.VehicleStatus.ACTIVE);
    }

    @Transactional
    public void updateDriverPosition(String id, Double lat, Double lng, String currentUsername) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!driver.getUser().getUserName().equals(currentUsername)) {
            log.warn("User {} tried to update position of driver {}", currentUsername, id);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        driver.setLatitude(lat);
        driver.setLongitude(lng);
        driverRepository.save(driver);

        notificationService.notifyDriverPositionUpdate(id, lat, lng);
    }

    public void getDriverPosition(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        notificationService.notifyDriverPositionUpdate(id, driver.getLatitude(), driver.getLongitude());
    }

}
