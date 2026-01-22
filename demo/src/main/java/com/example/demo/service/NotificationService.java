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

    public void notifyRideAccepted(String customerId, String driverId, String rideId) {
        log.info("Notifying customer {} that driver {} accepted ride {}", customerId, driverId, rideId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "RIDE_ACCEPTED");
        payload.put("driverId", driverId);
        payload.put("rideId", rideId);
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

    public void notifyRideStatusUpdate(String customerId, String rideId, com.example.demo.enums.Status status) {
        log.info("Notifying customer {} about ride {} status change to {}", customerId, rideId, status);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "RIDE_STATUS_UPDATE");
        payload.put("rideId", rideId);
        payload.put("status", status.toString());
        payload.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/customer/" + customerId, (Object) payload);
    }

}
