package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.request.RideRequest;
import com.example.demo.dto.request.UpdateRideStatusRequest;
import com.example.demo.dto.response.RideResponse;
import com.example.demo.service.RideService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
@Slf4j
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<java.util.Map<String, Object>> createRide(@RequestBody RideRequest request) {
        log.info("========== CREATE RIDE REQUEST RECEIVED ==========");
        log.info("Customer ID: {}", request.getCustomerId());
        log.info("Start Location: {}", request.getStartLocation());
        log.info("End Location: {}", request.getEndLocation());
        log.info("Customer Coordinates: [{}, {}]", request.getCustomerLatitude(), request.getCustomerLongitude());
        log.info("Distance: {} meters", request.getDistance());
        log.info("Fare: {} VND", request.getFare());
        log.info("Vehicle Type: {}", request.getVehicleType());

        java.util.Map<String, Object> response = rideService.createRide(request);

        log.info("========== CREATE RIDE RESPONSE ==========");
        log.info("Response: {}", response);

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
    public ResponseEntity<RideResponse> updateRide(@PathVariable String id, @RequestBody RideRequest request) {
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
            @RequestBody UpdateRideStatusRequest request) {
        RideResponse response = rideService.updateRideStatus(rideId, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/respond")
    public ResponseEntity<java.util.Map<String, Object>> driverResponse(
            @RequestBody com.example.demo.dto.request.DriverResponseRequest request) {
        log.info("========== DRIVER RESPONSE RECEIVED ==========");
        log.info("Ride Request ID: {}", request.getRideRequestId());
        log.info("Driver ID: {}", request.getDriverId());
        log.info("Accepted: {}", request.getAccepted());

        try {
            rideService.handleDriverResponse(request);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("message", request.getAccepted() ? "Ride accepted" : "Ride rejected");

            log.info("Driver response processed successfully");
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(response);
        } catch (Exception e) {
            log.error("Error processing driver response: " + e.getMessage(), e);

            java.util.Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());

            return ResponseEntity.status(500)
                    .header("Content-Type", "application/json")
                    .body(errorResponse);
        }
    }
}