package com.mycompany.rideapp.controller;

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
import org.springframework.security.core.Authentication;

import com.mycompany.rideapp.dto.request.VehicleRegisterRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.dto.response.VehicleRegisterResponse;
import com.mycompany.rideapp.enums.VehicleStatus;
import com.mycompany.rideapp.service.VehicleRegisterService;

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
            @RequestBody @Validated VehicleRegisterRequest request, Authentication auth) {
                String driverId = auth.getName();
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.registerVehicle(driverId, request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<VehicleRegisterResponse> getVehicleById(@PathVariable String id) {
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.getVehicleById(id))
                .build();
    }

    @GetMapping("/driver/{driverId}")
    public ApiResponse<List<VehicleRegisterResponse>> getVehiclesByDriverId(@PathVariable String driverId) {
        return ApiResponse.<List<VehicleRegisterResponse>>builder()
                .code(200)
                .results(vehicleRegisterService.getVehiclesByDriverId(driverId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<VehicleRegisterResponse> updateVehicle(
            @PathVariable String id,
            @RequestBody @Validated VehicleRegisterRequest request) {
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.updateVehicle(id, request))
                .build();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<VehicleRegisterResponse> updateVehicleStatus(
            @PathVariable String id,
            @RequestParam VehicleStatus status) {
        return ApiResponse.<VehicleRegisterResponse>builder()
                .code(200)
                .results(vehicleRegisterService.updateVehicleStatus(id, status))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteVehicle(@PathVariable String id) {
        vehicleRegisterService.deleteVehicle(id);
        return ApiResponse.<String>builder()
                .code(200)
                .results("Vehicle deleted successfully")
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<VehicleRegisterResponse>> getVehiclesByStatus(@PathVariable VehicleStatus status) {
        return ApiResponse.<List<VehicleRegisterResponse>>builder()
                .code(200)
                .results(vehicleRegisterService.getVehiclesByStatus(status))
                .build();
    }      
    @GetMapping("/my")
        public ApiResponse<List<VehicleRegisterResponse>> getMyVehicles(Authentication auth) {
        String driverId = auth.getName(); // hoặc từ JWT claim
        return ApiResponse.<List<VehicleRegisterResponse>>builder()
                .code(200)
                .results(vehicleRegisterService.getVehiclesByDriverId(driverId))
                .build();
}

}
