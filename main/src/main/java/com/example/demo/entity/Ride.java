package com.example.demo.entity;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    User driver;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    User customer;

    Long startTime;
    Long endTime;
    String startLocation;
    String endLocation;
    Long distance;
    Long fare;
    Long status;

    @OneToMany(mappedBy = "ride")
    List<Review> reviews;

    @OneToMany(mappedBy = "ride")
    List<Payment> payments;
    
}