package com.mycompany.rideapp.repository;

import java.lang.StackWalker.Option;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mycompany.rideapp.entity.Ride;

public interface RideRepository extends JpaRepository<Ride, String> {
    List<Ride> findByDriver_Id(String driverId);
    List<Ride> findByCustomer_Id(String customerId);
    @Query("SELECT r FROM Ride r WHERE r.driver.id = :userId OR r.customer.id = :userId")
    List<Ride> findByUserId(@Param("userId") String userId);

    @Query("SELECT r FROM Ride r WHERE (r.driver.id = :userId OR r.customer.id = :userId) AND r.status NOT IN (com.mycompany.rideapp.enums.Status.FINISHED, com.mycompany.rideapp.enums.Status.CANCELLED)")
    Optional<Ride> findActiveRideByUserId(@Param("userId") String userId);
}