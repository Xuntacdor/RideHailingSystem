package com.example.demo.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.example.demo.dto.DriverPosition;
import com.example.demo.dto.request.DriverResponseRequest;
import com.example.demo.service.DriverService;
import com.example.demo.service.RideService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final RideService rideService;
    private final DriverService driverService;

    @MessageMapping("/driver/response")
    public void handleDriverResponse(@Payload DriverResponseRequest request) {
        log.info("Received driver response: {} for ride request: {}",
                request.getAccepted() ? "ACCEPTED" : "REJECTED",
                request.getRideRequestId());

        rideService.handleDriverResponse(request);
    }

    @MessageMapping("/driver/updatePos")
    public void updateDriverPosition(@Payload @Valid DriverPosition driverPosition, Principal principal) {

        if (principal == null) {
            log.error("Unauthenticated user trying to update position");
            return;
        }

        log.info("Update pos for driver: {} by user: {}", driverPosition.getDriverId(), principal.getName());
        driverService.updateDriverPosition(
                driverPosition.getDriverId(),
                driverPosition.getLat(),
                driverPosition.getLng(),
                principal.getName());
    }

}
