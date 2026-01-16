
package com.example.demo.entity;

import java.util.List;

import com.example.demo.enums.AccountStatus;
import com.example.demo.enums.Role;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Users")
@Getter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String name;
    String userName;
    String phoneNumber;
    String password;
    String imageUrl;

    @Enumerated(EnumType.STRING)
    Role role;

    String cccd;
    String email;
    String accountType;
    AccountStatus status;

    @OneToMany(mappedBy = "user")
    List<Notification> notifications;

    @OneToMany(mappedBy = "user")
    List<History> histories;

    @OneToMany(mappedBy = "user")
    List<Rate> ratesGiven;

    @OneToMany(mappedBy = "ratedUser")
    List<Rate> ratesReceived;

    @OneToMany(mappedBy = "driver")
    List<Ride> ridesAsDriver;

    @OneToMany(mappedBy = "customer")
    List<Ride> ridesAsCustomer;

    @OneToMany(mappedBy = "reviewer")
    List<Review> reviewsGiven;

    @OneToMany(mappedBy = "reviewee")
    List<Review> reviewsReceived;
}