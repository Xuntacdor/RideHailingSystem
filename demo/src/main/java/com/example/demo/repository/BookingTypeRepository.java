package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.BookingType;
import com.example.demo.enums.VehicleType;

@Repository
public interface BookingTypeRepository extends JpaRepository<BookingType, String> {

    Optional<BookingType> findByCode(String code);

    List<BookingType> findByVehicleType(VehicleType vehicleType);

    List<BookingType> findByActiveTrue();
}
