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

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<RideResponse> createRide(@RequestBody RideRequest request) {
        RideResponse response = rideService.createRide(request);
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
            @RequestBody UpdateRideStatusRequest request
    ) {
        RideResponse response = rideService.updateRideStatus(rideId, request.getStatus());
        return ResponseEntity.ok(response);
    }
}