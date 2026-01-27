package com.mycompany.rideapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
public class PayOSConfig {

    @Value("${PayOS.clientId}")
    private String clientId;

    @Value("${PayOS.clientSecret}")
    private String apiKey;

    @Value("${PayOS.checksumKey}")
    private String checksumKey;

    @Bean
    public PayOS payOS() {
        return new PayOS(clientId, apiKey, checksumKey);
    }
}