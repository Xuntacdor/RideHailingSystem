
package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import org.springdoc.core.converters.models.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mycompany.rideapp.entity.Driver;

public interface DriverRepository extends JpaRepository<Driver, String> {
        @Query("SELECT d FROM Driver d WHERE d.user.id = :userId")
        Optional<Driver> findByUserId(@Param("userId") String userId);

        Optional<Driver> findByLicenseNumber(String licenseNumber);

        List<Driver> findByDriverStatus(String driverStatus);

        @Query("SELECT d FROM Driver d WHERE d.driverStatus = com.mycompany.rideapp.enums.AccountStatus.ACTIVE ORDER BY "
                        + "((d.latitude - :lat) * (d.latitude - :lat) + (d.longitude - :lng) * (d.longitude - :lng)) ASC")
        List<Driver> findNearestDrivers(@Param("lat") Double lat, @Param("lng") Double lng,
                        PageRequest pageable);

        @Query("SELECT d FROM Driver d WHERE d.driverStatus = com.mycompany.rideapp.enums.AccountStatus.ACTIVE " +
                        "AND d.latitude IS NOT NULL AND d.longitude IS NOT NULL " +
                        "AND d.latitude BETWEEN :minLat AND :maxLat " +
                        "AND d.longitude BETWEEN :minLng AND :maxLng")
        List<Driver> findDriversByLocationBounds(@Param("minLat") Double minLat, @Param("maxLat") Double maxLat,
                        @Param("minLng") Double minLng, @Param("maxLng") Double maxLng);

        // @Query("SELECT d FROM Driver d WHERE d.driverStatus =
        // com.mycompany.rideapp.enums.AccountStatus.ACTIVE " +
        // + "ORDER BY ((d.latitude - :lat) * (d.latitude - :lng) * (d.longitude -
        // :lng)) ASC")
        // List<Driver> findNearestDriversInPreferredArea(@Param("lat") Double lat,
        // @Param("lng") Double lng,
        // Pageable pageable);

}
