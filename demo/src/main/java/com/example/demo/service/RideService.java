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

    private final Map<String, PendingRide> pendingRides = new ConcurrentHashMap<>();

    public Map<String, Object> createRide(RideRequest request) {
        log.info(">>> RideService.createRide() started");
        log.info("Customer coordinates: [{} {}]", request.getCustomerLatitude(), request.getCustomerLongitude());
        log.info("Driver coordinates: [{} {}]", request.getStartLatitude(), request.getStartLongitude());
        log.info("End coordinates: [{} {}]", request.getEndLatitude(), request.getEndLongitude());
        String rideRequestId = UUID.randomUUID().toString();
        log.info("Generated ride request ID: {}", rideRequestId);

        log.info("Searching for nearest drivers at coordinates: [{}, {}]",
                request.getCustomerLatitude(), request.getCustomerLongitude());

        List<DriverResponse> nearestDrivers = driverService.getNearestDrivers(
                request.getCustomerLatitude(),
                request.getCustomerLongitude(),
                10,
                request.getVehicleType());

        if (nearestDrivers.isEmpty()) {
            log.warn("No available drivers found for request {}", rideRequestId);
            throw new ResourceNotFoundException("No available drivers found");
        }
        List<String> driverIds = nearestDrivers.stream()
                .map(DriverResponse::getId)
                .collect(Collectors.toList());

        log.info("Driver IDs: {}", driverIds);

        PendingRide pendingRide = PendingRide.builder()
                .rideRequestId(rideRequestId)
                .request(request)
                .driverIds(driverIds)
                .currentDriverIndex(0)
                .timestamp(System.currentTimeMillis())
                .build();

        pendingRides.put(rideRequestId, pendingRide);
        log.info("Stored pending ride: {}", rideRequestId);

        log.info("Sending notification to first driver: {}", driverIds.get(0));
        sendNotificationToCurrentDriver(pendingRide);

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
            handleDriverAcceptance(pendingRide, response.getDriverId());
        } else {
            handleDriverRejection(pendingRide);
        }
    }

    private void handleDriverAcceptance(PendingRide pendingRide, String driverId) {
        log.info("Driver {} accepted ride request {}", driverId, pendingRide.getRideRequestId());

        try {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
            User customer = userRepository.findById(pendingRide.getRequest().getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

            Ride ride = Ride.builder()
                    .driver(driver)
                    .customer(customer)
                    .startTime(pendingRide.getRequest().getStartTime())
                    .endTime(pendingRide.getRequest().getEndTime())
                    .startLatitude(pendingRide.getRequest().getStartLatitude())
                    .startLongitude(pendingRide.getRequest().getStartLongitude())
                    .endLatitude(pendingRide.getRequest().getEndLatitude())
                    .endLongitude(pendingRide.getRequest().getEndLongitude())
                    .distance(pendingRide.getRequest().getDistance())
                    .fare(pendingRide.getRequest().getFare())
                    .status(Status.CONFIRMED)
                    .vehicleType(pendingRide.getRequest().getVehicleType())
                    .build();

            ride = rideRepository.save(ride);

            notificationService.notifyRideAccepted(
                    pendingRide.getRequest().getCustomerId(),
                    driverId,
                    ride.getId());

            notificationService.notifyDriverRideCreated(
                    driverId,
                    ride.getId(),
                    pendingRide.getRequest().getCustomerId());
            pendingRides.remove(pendingRide.getRideRequestId());

            log.info("Ride {} created successfully", ride.getId());
        } catch (Exception e) {
            log.error("Error creating ride: {}", e.getMessage(), e);
            handleDriverRejection(pendingRide);
        }
    }

    private void handleDriverRejection(PendingRide pendingRide) {
        log.info("Driver rejected ride request {}", pendingRide.getRideRequestId());

        pendingRide.setCurrentDriverIndex(pendingRide.getCurrentDriverIndex() + 1);

        if (pendingRide.getCurrentDriverIndex() >= pendingRide.getDriverIds().size()) {
            log.warn("No more drivers available for ride request {}", pendingRide.getRideRequestId());
            notificationService.notifyNoDriverAvailable(
                    pendingRide.getRequest().getCustomerId(),
                    pendingRide.getRideRequestId());
            pendingRides.remove(pendingRide.getRideRequestId());
        } else {
            sendNotificationToCurrentDriver(pendingRide);
        }
    }

    private void sendNotificationToCurrentDriver(PendingRide pendingRide) {
        String currentDriverId = pendingRide.getDriverIds().get(pendingRide.getCurrentDriverIndex());

        RideNotification notification = RideNotification.builder()
                .rideRequestId(pendingRide.getRideRequestId())
                .customerId(pendingRide.getRequest().getCustomerId())
                // .startLocation(pendingRide.getRequest().getStartLocation())
                // .endLocation(pendingRide.getRequest().getEndLocation())
                .startLatitude(pendingRide.getRequest().getStartLatitude())
                .startLongitude(pendingRide.getRequest().getStartLongitude())
                .endLatitude(pendingRide.getRequest().getEndLatitude())
                .endLongitude(pendingRide.getRequest().getEndLongitude())
                // .customerLatitude(pendingRide.getRequest().getCustomerLatitude())
                // .customerLongitude(pendingRide.getRequest().getCustomerLongitude())
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

        if (ride.getCustomer() != null) {
            notificationService.notifyRideStatusUpdate(
                    ride.getCustomer().getId(),
                    rideId,
                    status);
        }

        return rideMapper.toResponse(ride);
    }

    public Map<String, Object> cancelRide(String rideId, String userId, String role) {
        log.info("Cancelling ride {} by user {} with role {}", rideId, userId, role);

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (role.equals("DRIVER") && (ride.getDriver() == null || !ride.getDriver().getId().equals(userId))) {
            throw new RuntimeException("Not authorized to cancel this ride");
        }
        if (role.equals("CUSTOMER") && (ride.getCustomer() == null || !ride.getCustomer().getId().equals(userId))) {
            throw new RuntimeException("Not authorized to cancel this ride");
        }

        ride.setStatus(Status.CANCELLED);
        rideRepository.save(ride);

        if (ride.getCustomer() != null && ride.getDriver() != null) {
            notificationService.notifyRideCancellation(
                    ride.getCustomer().getId(),
                    ride.getDriver().getId(),
                    rideId,
                    role);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Ride cancelled successfully");
        response.put("rideId", rideId);

        log.info("Ride {} cancelled successfully", rideId);
        return response;
    }
}