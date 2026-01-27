
package com.mycompany.rideapp.entity;

import java.util.List;

import com.mycompany.rideapp.enums.AccountStatus;
import com.mycompany.rideapp.enums.Role;

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
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Users")
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
    @ToString.Exclude
    List<Notification> notifications;

    @OneToMany(mappedBy = "user")
    @ToString.Exclude
    List<History> histories;

    @OneToMany(mappedBy = "user")
    @ToString.Exclude
    List<Rate> ratesGiven;

    @OneToMany(mappedBy = "ratedUser")
    @ToString.Exclude
    List<Rate> ratesReceived;

    @OneToMany(mappedBy = "customer")
    @ToString.Exclude
    List<Ride> ridesAsCustomer;

    @OneToMany(mappedBy = "reviewer")
    @ToString.Exclude
    List<Review> reviewsGiven;

    @OneToMany(mappedBy = "reviewee")
    @ToString.Exclude
    List<Review> reviewsReceived;
}