package com.mycompany.rideapp.dto;

import lombok.Data;

@Data
public class DriverPosition {
    String driverId;
    Double lat;
    Double lng;
}
