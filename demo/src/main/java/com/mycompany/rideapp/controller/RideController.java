package com.mycompany.rideapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.rideapp.dto.request.RideRequest;
import com.mycompany.rideapp.dto.request.UpdateRideStatusRequest;
import com.mycompany.rideapp.dto.response.RideResponse;
import com.mycompany.rideapp.service.RideService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
@Slf4j
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<java.util.Map<String, Object>> createRide(@Valid @RequestBody RideRequest request) {
        java.util.Map<String, Object> response = rideService.createRide(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideResponse> getRideById(@PathVariable String id) {
        RideResponse response = rideService.getRideById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<RideResponse>> getAllRides() {
        List<RideResponse> responses = rideService.getAllRides();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RideResponse> updateRide(@PathVariable String id, @Valid @RequestBody RideRequest request) {
        RideResponse response = rideService.updateRide(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<RideResponse>> getRidesByDriver(@PathVariable String driverId) {
        return ResponseEntity.ok(rideService.getRidesByDriverId(driverId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RideResponse>> getRidesByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(rideService.getRidesByCustomerId(customerId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RideResponse>> getRidesByUser(@PathVariable String userId) {
        return ResponseEntity.ok(rideService.getRidesByUserId(userId));
    }

    @PatchMapping("/{rideId}/status")
    public ResponseEntity<RideResponse> updateRideStatus(
            @PathVariable String rideId,
            @Valid @RequestBody UpdateRideStatusRequest request) {
        RideResponse response = rideService.updateRideStatus(rideId, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/respond")
    public ResponseEntity<java.util.Map<String, Object>> driverResponse(
            @Valid @RequestBody com.mycompany.rideapp.dto.request.DriverResponseRequest request) {
        try {
            rideService.handleDriverResponse(request);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("message", request.getAccepted() ? "Ride accepted" : "Ride rejected");

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(response);
        } catch (Exception e) {

            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(500)
                    .header("Content-Type", "application/json")
                    .body(errorResponse);
        }
    }

    @DeleteMapping("/{rideId}/cancel")
    public ResponseEntity<java.util.Map<String, Object>> cancelRide(
            @PathVariable String rideId,
            @RequestParam String userId,
            @RequestParam String role) {

        try {
            java.util.Map<String, Object> response = rideService.cancelRide(rideId, userId, role);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{rideId}/cancel-pending")
    public ResponseEntity<java.util.Map<String, Object>> cancelPendingRide(@PathVariable String rideId) {
        try {
            rideService.cancelPendingRide(rideId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}