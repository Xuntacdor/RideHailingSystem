package com.example.demo.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.request.VehicleRegisterRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.VehicleRegisterResponse;
import com.example.demo.enums.VehicleStatus;
import com.example.demo.service.VehicleRegisterService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/vehicle")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VehicleRegisterController {
    VehicleRegisterService vehicleRegisterService;

    @PostMapping
    public ApiResponse<VehicleRegisterResponse> registerVehicle(
            @RequestBody @Validated VehicleRegisterRequest request) {
        log.info("Registering vehicle for driver: {}", request.getDriverId());
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.registerVehicle(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<VehicleRegisterResponse> getVehicleById(@PathVariable String id) {
        log.info("Getting vehicle by ID: {}", id);
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.getVehicleById(id))
                .build();
    }

    @GetMapping("/driver/{driverId}")
    public ApiResponse<List<VehicleRegisterResponse>> getVehiclesByDriverId(@PathVariable String driverId) {
        log.info("Getting vehicles for driver ID: {}", driverId);
        return ApiResponse.<List<VehicleRegisterResponse>>builder()
                .code(200)
                .results(vehicleRegisterService.getVehiclesByDriverId(driverId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<VehicleRegisterResponse> updateVehicle(
            @PathVariable String id,
            @RequestBody @Validated VehicleRegisterRequest request) {
        log.info("Updating vehicle with ID: {}", id);
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.updateVehicle(id, request))
                .build();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<VehicleRegisterResponse> updateVehicleStatus(
            @PathVariable String id,
            @RequestParam VehicleStatus status) {
        log.info("Updating vehicle status for ID: {} to {}", id, status);
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.updateVehicleStatus(id, status))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteVehicle(@PathVariable String id) {
        log.info("Deleting vehicle with ID: {}", id);
        vehicleRegisterService.deleteVehicle(id);
        return ApiResponse.<String>builder()
                .code(200)
                .results("Vehicle deleted successfully")
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<VehicleRegisterResponse>> getVehiclesByStatus(@PathVariable VehicleStatus status) {
        log.info("Getting vehicles with status: {}", status);
        return ApiResponse.<List<VehicleRegisterResponse>>builder()
                .code(200)
                .results(vehicleRegisterService.getVehiclesByStatus(status))
                .build();
    }
}
