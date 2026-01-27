
package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mycompany.rideapp.entity.VehicleRegister;
import com.mycompany.rideapp.enums.VehicleStatus;

public interface VehicleRegisterRepository extends JpaRepository<VehicleRegister, String> {
    @Query("SELECT v FROM VehicleRegister v WHERE v.driver.id = :driverId")
    List<VehicleRegister> findByDriverId(@Param("driverId") String driverId);

    Optional<VehicleRegister> findByVehicleNumber(String vehicleNumber);

    List<VehicleRegister> findByStatus(VehicleStatus status);
}
