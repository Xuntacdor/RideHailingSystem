
package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Driver;

public interface DriverRepository extends JpaRepository<Driver, String> {
        @Query("SELECT d FROM Driver d WHERE d.user.id = :userId")
        Optional<Driver> findByUserId(@Param("userId") String userId);

        Optional<Driver> findByLicenseNumber(String licenseNumber);

        List<Driver> findByDriverStatus(String driverStatus);

        @Query("SELECT d FROM Driver d WHERE d.driverStatus = 'AVAILABLE' ORDER BY " +
                        "((d.latitude - :lat) * (d.latitude - :lat) + (d.longitude - :lng) * (d.longitude - :lng)) ASC")
        List<Driver> findNearestDrivers(@Param("lat") Double lat, @Param("lng") Double lng,
                        org.springframework.data.domain.Pageable pageable);

}
