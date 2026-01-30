
package com.mycompany.rideapp.repository;

import java.util.List;
import java.util.Optional;

import com.mycompany.rideapp.enums.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mycompany.rideapp.entity.User;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUserName(String userName);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:keyword IS NULL OR u.userName LIKE %:keyword% OR u.email LIKE %:keyword%)")
    List<User> filterUsers(@Param("role") Role role, @Param("keyword") String keyword);
}