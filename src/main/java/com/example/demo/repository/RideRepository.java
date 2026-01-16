package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Ride;

public interface RideRepository extends JpaRepository<Ride, String> {
    List<Ride> findByDriver_Id(String driverId);
    List<Ride> findByCustomer_Id(String customerId);
    @Query("SELECT r FROM Ride r WHERE r.driver.id = :userId OR r.customer.id = :userId")
    List<Ride> findByUserId(@Param("userId") String userId);
}