package com.example.demo.service;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.request.RideRequest;
import com.example.demo.dto.response.RideResponse;
import com.example.demo.entity.Ride;
import com.example.demo.enums.Status;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.RideMapper;
import com.example.demo.repository.RideRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final RideMapper rideMapper;

    public RideResponse createRide(RideRequest request) {
        Ride ride = rideMapper.toEntity(request);
        ride = rideRepository.save(ride);
        return rideMapper.toResponse(ride);
    }

    public RideResponse getRideById(String id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));
        return rideMapper.toResponse(ride);
    }

    public List<RideResponse> getAllRides() {
        List<Ride> rides = rideRepository.findAll();
        return rides.stream().map(rideMapper::toResponse).collect(Collectors.toList());
    }

    public RideResponse updateRide(String id, RideRequest request) {
        Ride oldRide = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));

        Ride updated = rideMapper.toEntity(request);
        updated.setId(id);
        updated.setReviews(oldRide.getReviews());
        updated.setPayments(oldRide.getPayments());

        updated = rideRepository.save(updated);
        return rideMapper.toResponse(updated);
    }

    // public void deleteRide(String id) {
    //     Ride ride = rideRepository.findById(id)
    //             .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));
    //     rideRepository.delete(ride);
    // }

    public List<RideResponse> getRidesByDriverId(String driverId) {
        List<Ride> rides = rideRepository.findByDriver_Id(driverId);
        return rides.stream().map(rideMapper::toResponse).collect(Collectors.toList());
    }

    public List<RideResponse> getRidesByCustomerId(String customerId) {
        List<Ride> rides = rideRepository.findByCustomer_Id(customerId);
        return rides.stream().map(rideMapper::toResponse).collect(Collectors.toList());
    }

    public List<RideResponse> getRidesByUserId(String userId) {
        List<Ride> rides = rideRepository.findByUserId(userId);
        return rides.stream().map(rideMapper::toResponse).collect(Collectors.toList());
    }

    public RideResponse updateRideStatus(String rideId, Status status) {
    Ride ride = rideRepository.findById(rideId)
            .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));
    ride.setStatus(status);
    ride = rideRepository.save(ride);
    return rideMapper.toResponse(ride);
    }
}