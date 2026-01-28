package com.mycompany.rideapp.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.mycompany.rideapp.dto.PendingRide;
import com.mycompany.rideapp.dto.request.DriverResponseRequest;
import com.mycompany.rideapp.dto.request.RideRequest;
import com.mycompany.rideapp.dto.response.DriverResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.Ride;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.enums.VehicleType;
import com.mycompany.rideapp.repository.DriverRepository;
import com.mycompany.rideapp.repository.RideRepository;
import com.mycompany.rideapp.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class RideServiceRetryTest {

    @Mock
    private RideRepository rideRepository;
    @Mock
    private DriverService driverService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private DriverRepository driverRepository;

    // We cannot easily mock the internal scheduler initialized in field declaration
    // without setters or reflection or refactoring.
    // However, for this unit test, we might want to manually invoke the logic or
    // rely on partial integration if possible.
    // But since the scheduler is private final and initialized in-line, it is hard
    // to replace.
    // Ideally code should be refactored to allow injecting scheduler.
    // For now, we will test the logic by triggering methods and observing side
    // effects,
    // but the asynchronous part (RetryTask running automatically) is hard to test
    // deterministically without awaiting.
    // We can use reflection to replace the scheduler if needed or just test the
    // handleResponse logic primarily.

    @InjectMocks
    private RideService rideService;

    @BeforeEach
    void setUp() {
        // We can replace the scheduler with a mock if we want to verify scheduling
        // ReflectionTestUtils.setField(rideService, "scheduler", mockScheduler);
    }

    @Test
    void testCreateRideStartsSearch() {
        RideRequest request = new RideRequest();
        request.setCustomerId("cust1");
        request.setCustomerLatitude(10.0);
        request.setCustomerLongitude(20.0);
        request.setVehicleType(VehicleType.CAR);

        DriverResponse d1 = new DriverResponse();
        d1.setId("d1");
        DriverResponse d2 = new DriverResponse();
        d2.setId("d2");

        when(driverService.getNearestDrivers(anyDouble(), anyDouble(), anyInt(), any(VehicleType.class)))
                .thenReturn(Arrays.asList(d1, d2));

        Map<String, Object> result = rideService.createRide(request);

        assertNotNull(result.get("rideRequestId"));
        assertEquals("PENDING", result.get("status"));

        // Verify notification sent to first driver
        verify(notificationService).sendRideRequestToDriver(eq("d1"), any());
    }

    @Test
    void testDriverAcceptance() {
        // Setup pending ride
        String rideRequestId = "req1";
        RideRequest request = new RideRequest();
        request.setCustomerId("cust1");
        List<String> driverIds = Arrays.asList("d1", "d2");

        PendingRide pendingRide = PendingRide.builder()
                .rideRequestId(rideRequestId)
                .request(request)
                .driverIds(driverIds)
                .currentDriverIndex(0)
                .build();

        // Inject into map
        Map<String, PendingRide> pendingRides = (Map<String, PendingRide>) ReflectionTestUtils.getField(rideService,
                "pendingRides");
        pendingRides.put(rideRequestId, pendingRide);

        // Mock dependencies
        when(driverRepository.findById("d1")).thenReturn(Optional.of(new Driver()));
        when(userRepository.findById("cust1")).thenReturn(Optional.of(new User()));
        when(rideRepository.save(any(Ride.class))).thenAnswer(i -> {
            Ride r = i.getArgument(0);
            r.setId("ride1");
            return r;
        });

        // Trigger acceptance
        DriverResponseRequest response = new DriverResponseRequest();
        response.setRideRequestId(rideRequestId);
        response.setDriverId("d1");
        response.setAccepted(true);

        rideService.handleDriverResponse(response);

        // Verify ride created
        verify(rideRepository).save(any(Ride.class));
        verify(notificationService).notifyRideAccepted(eq("cust1"), any(), eq("ride1"));

        // Verify retry stopped (implicitly by ride being removed from pending map)
        assertEquals(0, pendingRides.size());
    }

    @Test
    void testDriverRejectionMovesToNext() {
        // Setup pending ride
        String rideRequestId = "req1";
        RideRequest request = new RideRequest();
        request.setCustomerId("cust1");
        List<String> driverIds = Arrays.asList("d1", "d2");

        PendingRide pendingRide = PendingRide.builder()
                .rideRequestId(rideRequestId)
                .request(request)
                .driverIds(driverIds)
                .currentDriverIndex(0)
                .build();

        // Inject into map
        Map<String, PendingRide> pendingRides = (Map<String, PendingRide>) ReflectionTestUtils.getField(rideService,
                "pendingRides");
        pendingRides.put(rideRequestId, pendingRide);

        // Trigger rejection
        DriverResponseRequest response = new DriverResponseRequest();
        response.setRideRequestId(rideRequestId);
        response.setDriverId("d1");
        response.setAccepted(false);

        rideService.handleDriverResponse(response);

        // Verify moved to next driver
        assertEquals(1, pendingRide.getCurrentDriverIndex());
        verify(notificationService).sendRideRequestToDriver(eq("d2"), any());
    }
}
