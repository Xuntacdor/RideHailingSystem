package com.example.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.PendingRide;
import com.example.demo.dto.RideNotification;
import com.example.demo.dto.request.DriverResponseRequest;
import com.example.demo.dto.request.RideRequest;
import com.example.demo.dto.response.DriverResponse;
import com.example.demo.dto.response.RideResponse;
import com.example.demo.entity.Driver;
import com.example.demo.entity.Ride;
import com.example.demo.entity.User;
import com.example.demo.enums.Status;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.RideMapper;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.RideRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RideService {

    private final RideRepository rideRepository;
    private final RideMapper rideMapper;
    private final DriverService driverService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

    // In-memory storage for pending rides
    private final Map<String, PendingRide> pendingRides = new ConcurrentHashMap<>();

    public Map<String, Object> createRide(RideRequest request) {
        log.info(">>> RideService.createRide() started");

        // Generate ride request ID
        String rideRequestId = UUID.randomUUID().toString();
        log.info("Generated ride request ID: {}", rideRequestId);

        // Get nearest available drivers
        log.info("Searching for nearest drivers at coordinates: [{}, {}]",
                request.getCustomerLatitude(), request.getCustomerLongitude());

        List<DriverResponse> nearestDrivers = driverService.getNearestDrivers(
                request.getCustomerLatitude(),
                request.getCustomerLongitude(),
                10);

        log.info("Found {} nearest drivers", nearestDrivers.size());

        if (nearestDrivers.isEmpty()) {
            log.warn("No available drivers found for request {}", rideRequestId);
            throw new ResourceNotFoundException("No available drivers found");
        }

        // Extract driver IDs
        List<String> driverIds = nearestDrivers.stream()
                .map(DriverResponse::getId)
                .collect(Collectors.toList());

        log.info("Driver IDs: {}", driverIds);

        // Store pending ride
        PendingRide pendingRide = PendingRide.builder()
                .rideRequestId(rideRequestId)
                .request(request)
                .driverIds(driverIds)
                .currentDriverIndex(0)
                .timestamp(System.currentTimeMillis())
                .build();

        pendingRides.put(rideRequestId, pendingRide);
        log.info("Stored pending ride: {}", rideRequestId);

        // Send notification to first driver
        log.info("Sending notification to first driver: {}", driverIds.get(0));
        sendNotificationToCurrentDriver(pendingRide);

        // Return pending status
        Map<String, Object> response = new HashMap<>();
        response.put("rideRequestId", rideRequestId);
        response.put("status", "PENDING");
        response.put("message", "Finding driver...");
        response.put("nearestDriversCount", driverIds.size());

        log.info("<<< RideService.createRide() completed successfully");
        return response;
    }

    public void handleDriverResponse(DriverResponseRequest response) {
        String rideRequestId = response.getRideRequestId();
        PendingRide pendingRide = pendingRides.get(rideRequestId);

        if (pendingRide == null) {
            log.warn("Received response for unknown ride request: {}", rideRequestId);
            return;
        }

        if (response.getAccepted()) {
            // Driver accepted - create the ride
            handleDriverAcceptance(pendingRide, response.getDriverId());
        } else {
            // Driver rejected - try next driver
            handleDriverRejection(pendingRide);
        }
    }

    private void handleDriverAcceptance(PendingRide pendingRide, String driverId) {
        log.info("Driver {} accepted ride request {}", driverId, pendingRide.getRideRequestId());

        try {
            // Get driver and customer
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
            User customer = userRepository.findById(pendingRide.getRequest().getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

            // Create the ride
            Ride ride = Ride.builder()
                    .driver(driver)
                    .customer(customer)
                    .startTime(pendingRide.getRequest().getStartTime())
                    .endTime(pendingRide.getRequest().getEndTime())
                    .startLocation(pendingRide.getRequest().getStartLocation())
                    .endLocation(pendingRide.getRequest().getEndLocation())
                    .distance(pendingRide.getRequest().getDistance())
                    .fare(pendingRide.getRequest().getFare())
                    .status(Status.CONFIRMED)
                    .vehicleType(pendingRide.getRequest().getVehicleType())
                    .build();

            ride = rideRepository.save(ride);

            // Notify customer
            notificationService.notifyRideAccepted(
                    pendingRide.getRequest().getCustomerId(),
                    driverId,
                    ride.getId());

            // Remove from pending
            pendingRides.remove(pendingRide.getRideRequestId());

            log.info("Ride {} created successfully", ride.getId());
        } catch (Exception e) {
            log.error("Error creating ride: {}", e.getMessage(), e);
            // Try next driver
            handleDriverRejection(pendingRide);
        }
    }

    private void handleDriverRejection(PendingRide pendingRide) {
        log.info("Driver rejected ride request {}", pendingRide.getRideRequestId());

        // Move to next driver
        pendingRide.setCurrentDriverIndex(pendingRide.getCurrentDriverIndex() + 1);

        if (pendingRide.getCurrentDriverIndex() >= pendingRide.getDriverIds().size()) {
            // No more drivers available
            log.warn("No more drivers available for ride request {}", pendingRide.getRideRequestId());
            notificationService.notifyNoDriverAvailable(
                    pendingRide.getRequest().getCustomerId(),
                    pendingRide.getRideRequestId());
            pendingRides.remove(pendingRide.getRideRequestId());
        } else {
            // Send notification to next driver
            sendNotificationToCurrentDriver(pendingRide);
        }
    }

    private void sendNotificationToCurrentDriver(PendingRide pendingRide) {
        String currentDriverId = pendingRide.getDriverIds().get(pendingRide.getCurrentDriverIndex());

        RideNotification notification = RideNotification.builder()
                .rideRequestId(pendingRide.getRideRequestId())
                .customerId(pendingRide.getRequest().getCustomerId())
                .startLocation(pendingRide.getRequest().getStartLocation())
                .endLocation(pendingRide.getRequest().getEndLocation())
                .customerLatitude(pendingRide.getRequest().getCustomerLatitude())
                .customerLongitude(pendingRide.getRequest().getCustomerLongitude())
                .distance(pendingRide.getRequest().getDistance())
                .fare(pendingRide.getRequest().getFare())
                .vehicleType(pendingRide.getRequest().getVehicleType())
                .timestamp(System.currentTimeMillis())
                .build();

        notificationService.sendRideRequestToDriver(currentDriverId, notification);
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