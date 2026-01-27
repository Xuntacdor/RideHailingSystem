package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mycompany.rideapp.entity.BookingType;
import com.mycompany.rideapp.enums.VehicleType;

@Repository
public interface BookingTypeRepository extends JpaRepository<BookingType, String> {

    Optional<BookingType> findByCode(String code);

    List<BookingType> findByVehicleType(VehicleType vehicleType);

    List<BookingType> findByActiveTrue();
}
