
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

        return driverMapper.toResponse(driver);
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

        return driverMapper.toResponse(driver);
    }

    public DriverResponse updateDriverStatus(String id, String status) {
        log.info("📝 [STATUS] Updating driver {} status to {}", id, status);

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        AccountStatus oldStatus = driver.getDriverStatus();
        driver.setDriverStatus(AccountStatus.valueOf(status));
        driverRepository.save(driver);

        log.info("📝 [STATUS] Driver {} status changed from {} to {}", id, oldStatus, status);
        log.info("📝 [STATUS] Driver location: lat={}, lng={}", driver.getLatitude(), driver.getLongitude());

        return driverMapper.toResponse(driver);
    }

    public DriverResponse uploadDriverAvatar(String id, MultipartFile file) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String path = imageStorageService.storeAvatar(id, file);
        driver.setAvatarUrl(path);
        driverRepository.save(driver);

        return driverMapper.toResponse(driver);
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<DriverResponse> getDriversByStatus(String status) {
        return driverRepository.findByDriverStatus(AccountStatus.valueOf(status)).stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getNearestDrivers(Double lat, Double lng, int limit,
            com.mycompany.rideapp.enums.VehicleType vehicleType) {
        log.info("🔍 [SEARCH] Searching for nearest drivers at ({}, {}) with vehicle type: {}", lat, lng, vehicleType);

        // Debug: Check total drivers
        long totalDrivers = driverRepository.count();
        long activeDrivers = driverRepository.findByDriverStatus(AccountStatus.ACTIVE).size();
        log.info("🔍 [SEARCH] Total drivers in DB: {}, Active drivers: {}", totalDrivers, activeDrivers);

        List<Driver> drivers = driverRepository.findNearestDrivers(lat, lng,
                org.springframework.data.domain.PageRequest.of(0, limit * 3));

        log.info("🔍 [SEARCH] Found {} drivers from query (before vehicle type filter)", drivers.size());

        List<DriverResponse> result = drivers.stream()
                .filter(driver -> {
                    boolean hasVehicle = hasVehicleType(driver, vehicleType);
                    if (!hasVehicle) {
                        log.debug("Driver {} filtered out - no matching vehicle type", driver.getId());
                    }
                    return hasVehicle;
                })
                .limit(limit)
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());

        log.info("🔍 [SEARCH] Returning {} drivers after vehicle type filter", result.size());

        return result;
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

    public DriverResponse updateDriverPrefferedPosition(String id, Double lat, Double lng) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        driver.setPrefferedLatitude(lat);
        driver.setPrefferedLongitude(lng);
        driverRepository.save(driver);
        return driverMapper.toResponse(driver);
    }

    public boolean deleteDriverPrefferedPosition(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        driver.setPrefferedLatitude(null);
        driver.setPrefferedLongitude(null);
        driverRepository.save(driver);
        return true;
    }

    @Transactional(readOnly = true)
    public List<DriverResponse> getDriversByLocation(Double lat, Double lng, double zoom) {
        double radiusInKm = calculateRadiusFromZoom(zoom);

        double latDelta = radiusInKm / 111.0;
        double lngDelta = radiusInKm / (111.0 * Math.cos(Math.toRadians(lat)));

        double minLat = lat - latDelta;
        double maxLat = lat + latDelta;
        double minLng = lng - lngDelta;
        double maxLng = lng + lngDelta;

        List<Driver> drivers = driverRepository.findDriversByLocationBounds(minLat, maxLat, minLng, maxLng);

        return drivers.stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    private double calculateRadiusFromZoom(double zoom) {
        return 40000.0 / Math.pow(2, zoom);
    }

}
