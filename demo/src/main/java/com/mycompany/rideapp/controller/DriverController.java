package com.mycompany.rideapp.controller;

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

import com.mycompany.rideapp.dto.request.DriverRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.dto.response.DriverResponse;
import com.mycompany.rideapp.service.DriverService;

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
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.createDriver(request))
                                .build();
        }

        @GetMapping("/{id}")
        public ApiResponse<DriverResponse> getDriverById(@PathVariable String id) {
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.getDriverById(id))
                                .build();
        }

        @GetMapping("/user/{userId}")
        public ApiResponse<DriverResponse> getDriverByUserId(@PathVariable String userId) {
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.getDriverByUserId(userId))
                                .build();
        }

        @PutMapping("/{id}")
        public ApiResponse<DriverResponse> updateDriver(
                        @PathVariable String id,
                        @RequestBody @Validated DriverRequest request) {
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.updateDriver(id, request))
                                .build();
        }

        @PutMapping("/{id}/status")
        public ApiResponse<DriverResponse> updateDriverStatus(
                        @PathVariable String id,
                        @RequestParam String status) {
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.updateDriverStatus(id, status))
                                .build();
        }

        @PostMapping("/{id}/avatar")
        public ApiResponse<DriverResponse> uploadDriverAvatar(
                        @PathVariable String id,
                        @RequestPart("file") MultipartFile file) {
                return ApiResponse.<DriverResponse>builder()
                                .code(200)
                                .results(driverService.uploadDriverAvatar(id, file))
                                .build();
        }

        @GetMapping
        public ApiResponse<List<DriverResponse>> getAllDrivers() {
                return ApiResponse.<List<DriverResponse>>builder()
                                .code(200)
                                .results(driverService.getAllDrivers())
                                .build();
        }

        @GetMapping("/status/{status}")
        public ApiResponse<List<DriverResponse>> getDriversByStatus(@PathVariable String status) {
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
                        @RequestParam com.mycompany.rideapp.enums.VehicleType vehicleType) {
                return ApiResponse.<List<DriverResponse>>builder()
                                .code(200)
                                .results(driverService.getNearestDrivers(lat, lng, limit, vehicleType))
                                .build();
        }
}
