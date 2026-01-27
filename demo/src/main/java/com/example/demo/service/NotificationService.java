package com.example.demo.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RideNotification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendRideRequestToDriver(String driverId, RideNotification notification) {
        log.info("Sending ride request {} to driver {}", notification.getRideRequestId(), driverId);
        messagingTemplate.convertAndSend("/topic/driver/" + driverId, notification);
    }

    public void notifyCustomer(String customerId, Object message) {
        log.info("Notifying customer {} with message", customerId);
        messagingTemplate.convertAndSend("/topic/customer/" + customerId, message);
    }

    public void notifyRideAccepted(String customerId, com.example.demo.entity.Driver driver, String rideId) {
        log.info("Notifying customer {} that driver {} accepted ride {}", customerId, driver.getId(), rideId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "RIDE_ACCEPTED");
        payload.put("driverId", driver.getId());
        payload.put("rideId", rideId);
        payload.put("driverLat", driver.getLatitude());
        payload.put("driverLng", driver.getLongitude());
        messagingTemplate.convertAndSend("/topic/customer/" + customerId, (Object) payload);
    }

    public void notifyNoDriverAvailable(String customerId, String rideRequestId) {
        log.warn("No driver available for ride request {}", rideRequestId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "NO_DRIVER_AVAILABLE");
        payload.put("rideRequestId", rideRequestId);
        payload.put("message", "No available drivers found. Please try again later.");
        messagingTemplate.convertAndSend("/topic/customer/" + customerId, (Object) payload);
    }

    public void notifyDriverPositionUpdate(String driverId, Double lat, Double lng) {
        log.info("Notifying driver {} with position update {} {}", driverId, lat, lng);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "DRIVER_POSITION_UPDATE");
        payload.put("driverId", driverId);
        payload.put("lat", lat);
        payload.put("lng", lng);
        messagingTemplate.convertAndSend("/topic/driver/" + driverId + "/updatePos", (Object) payload);
    }

    public void notifyRideStatusUpdate(String customerId, String rideId, com.example.demo.enums.Status status, com.example.demo.entity.Driver driver) {
        log.info("Notifying customer {} about ride {} status change to {}", customerId, rideId, status);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "RIDE_STATUS_UPDATE");
        payload.put("rideId", rideId);
        payload.put("status", status.toString());
        payload.put("timestamp", System.currentTimeMillis());
        
        // Include driver position if available
        if (driver != null) {
            payload.put("driverId", driver.getId());
            payload.put("driverLat", driver.getLatitude());
            payload.put("driverLng", driver.getLongitude());
        }
        
        messagingTemplate.convertAndSend("/topic/customer/" + customerId, (Object) payload);
    }

    public void notifyRideCancellation(String customerId, String driverId, String rideId, String cancelledBy) {
        log.info("Notifying ride {} cancellation by {}", rideId, cancelledBy);

        // Notify customer
        Map<String, Object> customerPayload = new HashMap<>();
        customerPayload.put("type", "RIDE_CANCELLED");
        customerPayload.put("rideId", rideId);
        customerPayload.put("cancelledBy", cancelledBy);
        customerPayload.put("message",
                cancelledBy.equals("DRIVER") ? "Driver cancelled the ride" : "You cancelled the ride");
        customerPayload.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/customer/" + customerId, (Object) customerPayload);

        // Notify driver
        Map<String, Object> driverPayload = new HashMap<>();
        driverPayload.put("type", "RIDE_CANCELLED");
        driverPayload.put("rideId", rideId);
        driverPayload.put("cancelledBy", cancelledBy);
        driverPayload.put("message",
                cancelledBy.equals("CUSTOMER") ? "Customer cancelled the ride" : "You cancelled the ride");
        driverPayload.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/driver/" + driverId, (Object) driverPayload);
    }

    public void notifyDriverRideCreated(String driverId, String rideId, String customerId) {
        log.info("Notifying driver {} about created ride {}", driverId, rideId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "RIDE_CREATED");
        payload.put("rideId", rideId);
        payload.put("customerId", customerId);
        payload.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/driver/" + driverId, (Object) payload);
    }

}
