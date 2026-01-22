package com.example.demo.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.request.DriverRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.DriverResponse;
import com.example.demo.service.DriverService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DriverController {
        DriverService driverService;

        @PostMapping
        public ApiResponse<DriverResponse> createDriver(@RequestBody @Validated DriverRequest request) {
                log.info("Creating driver for user: {}", request.getUserId());
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.createDriver(request))
                                .build();
        }

        @GetMapping("/{id}")
        public ApiResponse<DriverResponse> getDriverById(@PathVariable String id) {
                log.info("Getting driver by ID: {}", id);
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.getDriverById(id))
                                .build();
        }

        @GetMapping("/user/{userId}")
        public ApiResponse<DriverResponse> getDriverByUserId(@PathVariable String userId) {
                log.info("Getting driver by user ID: {}", userId);
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.getDriverByUserId(userId))
                                .build();
        }

        @PutMapping("/{id}")
        public ApiResponse<DriverResponse> updateDriver(
                        @PathVariable String id,
                        @RequestBody @Validated DriverRequest request) {
                log.info("Updating driver with ID: {}", id);
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.updateDriver(id, request))
                                .build();
        }

        @PutMapping("/{id}/status")
        public ApiResponse<DriverResponse> updateDriverStatus(
                        @PathVariable String id,
                        @RequestParam String status) {
                log.info("Updating driver status for ID: {} to {}", id, status);
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.updateDriverStatus(id, status))
                                .build();
        }

        @PostMapping("/{id}/avatar")
        public ApiResponse<DriverResponse> uploadDriverAvatar(
                        @PathVariable String id,
                        @RequestPart("file") MultipartFile file) {
                log.info("Uploading avatar for driver ID: {}", id);
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.uploadDriverAvatar(id, file))
                                .build();
        }

        @GetMapping
        public ApiResponse<List<DriverResponse>> getAllDrivers() {
                log.info("Getting all drivers");
                return ApiResponse.<List<DriverResponse>>builder()
                                .code(200)
                                .results(driverService.getAllDrivers())
                                .build();
        }

        @GetMapping("/status/{status}")
        public ApiResponse<List<DriverResponse>> getDriversByStatus(@PathVariable String status) {
                log.info("Getting drivers with status: {}", status);
                return ApiResponse.<List<DriverResponse>>builder()
                                .code(200)
                                .results(driverService.getDriversByStatus(status))
                                .build();
        }

        @GetMapping("/nearest")
        public ApiResponse<List<DriverResponse>> getNearestDrivers(
                        @RequestParam Double lat,
                        @RequestParam Double lng,
                        @RequestParam(defaultValue = "10") int limit,
                        @RequestParam com.example.demo.enums.VehicleType vehicleType) {
                log.info("Getting {} nearest drivers for lat: {}, lng: {}, vehicleType: {}", limit, lat, lng,
                                vehicleType);
                return ApiResponse.<List<DriverResponse>>builder()
                                .code(200)
                                .results(driverService.getNearestDrivers(lat, lng, limit, vehicleType))
                                .build();
        }
}
