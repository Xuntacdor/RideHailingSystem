package com.example.demo.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.example.demo.dto.DriverPosition;
import com.example.demo.dto.request.DriverResponseRequest;
import com.example.demo.service.DriverService;
import com.example.demo.service.NotificationService;
import com.example.demo.service.RideService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final RideService rideService;
    private final DriverService driverService;
    private final NotificationService notificationService;

    @MessageMapping("/driver/response")
    public void handleDriverResponse(@Payload DriverResponseRequest request) {
        log.info("Received driver response: {} for ride request: {}",
                request.getAccepted() ? "ACCEPTED" : "REJECTED",
                request.getRideRequestId());

        rideService.handleDriverResponse(request);
    }

    @MessageMapping("/driver/updatePos")
    public void updateDriverPosition(@Payload DriverPosition driverPosition) {
        if (driverPosition == null){
            log.error("Driver position payload is null");
            return;
        }
        // if(!isValidCoordinate(driverPosition.getLat(),driverPosition.getLng())){
        //     log.warn("Invalid coordinates received from user: {}", principal != null ? principal.getName() : "Unknown");
        //     return;
        // }
        // if(principal == null){
        //     log.error("Unauthenticated user trying to update position");
        //     return;
        // }

        // log.info("Update pos for driver: {} by user: {}", driverPosition.getDriverId(), principal.getName());
        driverService.updateDriverPosition(driverPosition.getDriverId(),
                driverPosition.getLat(),
                driverPosition.getLng());


        notificationService.notifyDriverPositionUpdate(
                driverPosition.getDriverId(),
                driverPosition.getLat(),
                driverPosition.getLng());
        
    }
    private boolean isValidCoordinate(Double lat, Double lng) {
        return lat != null && lng != null &&
               lat >= -90 && lat <= 90 &&
               lng >= -180 && lng <= 180;
    }

}
