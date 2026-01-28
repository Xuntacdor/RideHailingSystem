package com.mycompany.rideapp.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mycompany.rideapp.dto.PendingRide;
import com.mycompany.rideapp.dto.RideNotification;
import com.mycompany.rideapp.dto.request.DriverResponseRequest;
import com.mycompany.rideapp.dto.request.RideRequest;
import com.mycompany.rideapp.dto.response.DriverResponse;
import com.mycompany.rideapp.dto.response.RideResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.Ride;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.enums.Status;
import com.mycompany.rideapp.exception.ResourceNotFoundException;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.mapper.RideMapper;
import com.mycompany.rideapp.repository.DriverRepository;
import com.mycompany.rideapp.repository.RideRepository;
import com.mycompany.rideapp.repository.UserRepository;

import jakarta.annotation.PreDestroy;
import java.util.concurrent.ScheduledFuture;
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
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    public Map<String, Object> createRide(RideRequest request) {
        String rideRequestId = UUID.randomUUID().toString();
        log.info("[CREATE_RIDE] Starting ride request {} for customer {}", rideRequestId, request.getCustomerId());
        
        List<DriverResponse> nearestDrivers = driverService.getNearestDrivers(
                request.getCustomerLatitude(),
                request.getCustomerLongitude(),
                10,
                request.getVehicleType());

        log.info("[CREATE_RIDE] Found {} nearest drivers for ride request {}", nearestDrivers.size(), rideRequestId);

        List<String> driverIds = nearestDrivers.stream()
                .map(DriverResponse::getId)
                .collect(Collectors.toList());

        PendingRide pendingRide = PendingRide.builder()
                .rideRequestId(rideRequestId)
                .request(request)
                .driverIds(driverIds) // nullable
                .currentDriverIndex(0)
                .accepted(new AtomicBoolean(false))
                .timestamp(System.currentTimeMillis())
                .build();

        pendingRides.put(rideRequestId, pendingRide);
        
        if (!driverIds.isEmpty()) {
            sendNotificationToCurrentDriver(pendingRide);
        }
        
        scheduleDriverRetryTask(pendingRide, 120);

        Map<String, Object> response = new HashMap<>();
        response.put("rideRequestId", rideRequestId);
        response.put("status", "SEARCHING");
        response.put("message", nearestDrivers.isEmpty() ? 
            "No drivers currently available, searching..." : 
            "Finding driver...");
        response.put("nearestDriversCount", driverIds.size());

        return response;
    }


    private void scheduleDriverRetryTask(PendingRide pendingRide, int maxRetries) {
        AtomicBoolean isCancelled = new AtomicBoolean(false);
        log.info("[RETRY_TASK] Setting up retry task for ride request {}, maxRetries: {}", 
                pendingRide.getRideRequestId(), maxRetries);

        Runnable retryTask = new Runnable() {
            int retryCount = 0;

            @Override
            public void run() {
                log.info("[RETRY_TASK] Retry task executing for ride request {}, retry count: {}/{}, current driver index: {}/{}",
                        pendingRide.getRideRequestId(), retryCount, maxRetries, 
                        pendingRide.getCurrentDriverIndex(), pendingRide.getDriverIds().size());

                if (isCancelled.get()) {
                    log.info("[RETRY_TASK] Task already cancelled for ride request {}", pendingRide.getRideRequestId());
                    cleanupPendingRide(pendingRide.getRideRequestId());
                    return;
                }

                if (pendingRide.getAccepted().get()) {
                    log.info("[RETRY_TASK] Ride request {} already accepted, stopping retry task", pendingRide.getRideRequestId());
                    cleanupPendingRide(pendingRide.getRideRequestId());
                    return;
                }

                retryCount++;
                log.info("[RETRY_TASK] Moving to next driver for ride request {}, retry: {}", 
                        pendingRide.getRideRequestId(), retryCount);
                handleDriverRejection(pendingRide);

                if (pendingRide.getCurrentDriverIndex() >= pendingRide.getDriverIds().size()) {
                    log.warn("[RETRY_TASK] No more drivers available for ride request {}. Tried {}/{} drivers",
                            pendingRide.getRideRequestId(), pendingRide.getCurrentDriverIndex(), pendingRide.getDriverIds().size());
                    notificationService.notifyNoDriverAvailable(
                            pendingRide.getRequest().getCustomerId(),
                            pendingRide.getRideRequestId());
                    cleanupPendingRide(pendingRide.getRideRequestId());
                    isCancelled.set(true);
                } else if (retryCount >= maxRetries) {
                    log.warn("[RETRY_TASK] Max retries ({}) reached for ride request {}. Current driver index: {}/{}",
                            maxRetries, pendingRide.getRideRequestId(), 
                            pendingRide.getCurrentDriverIndex(), pendingRide.getDriverIds().size());
                    notificationService.notifyNoDriverAvailable(
                            pendingRide.getRequest().getCustomerId(),
                            pendingRide.getRideRequestId());
                    cleanupPendingRide(pendingRide.getRideRequestId());
                    isCancelled.set(true);
                }
            }
        };

        log.info("[RETRY_TASK] Scheduling task with 10s initial delay and 10s period for ride request {}", 
                pendingRide.getRideRequestId());
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(retryTask, 10, 10,
                java.util.concurrent.TimeUnit.SECONDS);

        scheduledTasks.put(pendingRide.getRideRequestId(), future);
    }

    @Transactional
    public void handleDriverResponse(DriverResponseRequest response) {
        String rideRequestId = response.getRideRequestId();
        PendingRide pendingRide = pendingRides.get(rideRequestId);

        if (pendingRide == null) {
            return;
        }

        if (response.getAccepted()) {
            handleDriverAcceptance(pendingRide, response.getDriverId());
        } else {
            handleDriverRejection(pendingRide);
        }
    }

    private void cleanupPendingRide(String rideRequestId) {
        log.info("[CLEANUP] Cleaning up pending ride {}", rideRequestId);
        pendingRides.remove(rideRequestId);
        java.util.concurrent.ScheduledFuture<?> task = scheduledTasks.remove(rideRequestId);
        if (task != null) {
            task.cancel(false);
            log.info("[CLEANUP] Cancelled scheduled task for ride request {}", rideRequestId);
        }
        log.info("[CLEANUP] Remaining pending rides: {}", pendingRides.size());
    }

    private void handleDriverAcceptance(PendingRide pendingRide, String driverId) {
        // Mark as accepted to stop retries
        pendingRide.getAccepted().set(true);

        // Cancel scheduled retry task
        java.util.concurrent.ScheduledFuture<?> task = scheduledTasks.remove(pendingRide.getRideRequestId());
        if (task != null) {
            task.cancel(false);
        }

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
                    driver,
                    ride.getId());

            notificationService.notifyDriverRideCreated(
                    driverId,
                    ride.getId(),
                    pendingRide.getRequest().getCustomerId());
            pendingRides.remove(pendingRide.getRideRequestId());

            log.info("Ride {} created successfully", ride.getId());
        } catch (Exception e) {
            pendingRide.getAccepted().set(false);
        }
    }

    private void handleDriverRejection(PendingRide pendingRide) {
        // Only proceed if not already accepted (race condition check)
        if (pendingRide.getAccepted().get()) {
            return;
        }

        // Track rejected driver
        if (pendingRide.getCurrentDriverIndex() < pendingRide.getDriverIds().size()) {
            String rejectedDriverId = pendingRide.getDriverIds().get(pendingRide.getCurrentDriverIndex());
            pendingRide.getRejectedDriverIds().add(rejectedDriverId);
            log.info("Driver {} rejected/timed out for ride request {}. Total rejected: {}", 
                    rejectedDriverId, pendingRide.getRideRequestId(), pendingRide.getRejectedDriverIds().size());
        }

        log.info("Driver rejected or timed out for ride request {}", pendingRide.getRideRequestId());

        // Move to next driver
        pendingRide.setCurrentDriverIndex(pendingRide.getCurrentDriverIndex() + 1);

            if (pendingRide.getCurrentDriverIndex() >= pendingRide.getDriverIds().size()) {
        log.info("[RE_FETCH] Re-fetching drivers for ride request {}. Rejected drivers: {}", 
                pendingRide.getRideRequestId(), pendingRide.getRejectedDriverIds());
        
        List<DriverResponse> newDrivers = driverService.getNearestDrivers(
            pendingRide.getRequest().getCustomerLatitude(),
            pendingRide.getRequest().getCustomerLongitude(),
            10,
            pendingRide.getRequest().getVehicleType()
        );
        
        log.info("[RE_FETCH] Found {} new drivers before filtering", newDrivers.size());
        
        List<String> newDriverIds = newDrivers.stream()
            .map(DriverResponse::getId)
            .filter(id -> !pendingRide.getRejectedDriverIds().contains(id))
            .collect(Collectors.toList());
        
        log.info("[RE_FETCH] Found {} new drivers after filtering rejected ones", newDriverIds.size());
        
        if (!newDriverIds.isEmpty()) {
            pendingRide.setDriverIds(newDriverIds);
            pendingRide.setCurrentDriverIndex(0);
            log.info("[RE_FETCH] Updated driver list, sending to first new driver");
            sendNotificationToCurrentDriver(pendingRide);
            return;
        } else {
            log.warn("[RE_FETCH] No new drivers available after filtering");
        }
    }

        // Send notification to next driver if available
        if (pendingRide.getCurrentDriverIndex() < pendingRide.getDriverIds().size()) {
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
                    status,
                    ride.getDriver());
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
        if (role.equals("USER") && (ride.getCustomer() == null || !ride.getCustomer().getId().equals(userId))) {
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

    public void cancelPendingRide(String rideRequestId) {
        log.info("[CANCEL_PENDING] Cancelling pending ride request {}", rideRequestId);
        PendingRide removed = pendingRides.remove(rideRequestId);
        if (removed != null) {
            log.info("[CANCEL_PENDING] Removed pending ride {} from map. Was at driver index {}/{}",
                    rideRequestId, removed.getCurrentDriverIndex(), removed.getDriverIds().size());
        } else {
            log.warn("[CANCEL_PENDING] Ride request {} not found in pending rides map", rideRequestId);
        }
        
        ScheduledFuture<?> task = scheduledTasks.remove(rideRequestId);
        if (task != null) {
            boolean wasCancelled = task.cancel(false);
            log.info("[CANCEL_PENDING] Cancelled scheduled task for ride request {}, success: {}", 
                    rideRequestId, wasCancelled);
        } else {
            log.warn("[CANCEL_PENDING] No scheduled task found for ride request {}", rideRequestId);
        }
        log.info("[CANCEL_PENDING] Remaining pending rides: {}, scheduled tasks: {}", 
                pendingRides.size(), scheduledTasks.size());
    }

    @PreDestroy
    public void cleanup() {
        scheduledTasks.values().forEach(task -> task.cancel(false));
        scheduler.shutdown();
    }
}