package com.mycompany.rideapp.security;

import java.text.ParseException;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TokenProvider {

    @Value("${spring.security.oauth2.resourceserver.jwt.secret}")
    private String signalKey;

    public String getUserIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getSubject();
        } catch (ParseException e) {
            log.error("Invalid JWT token", e);
            return null;
        }
    }

    public boolean validateToken(String authToken) {
        try {
            JWSVerifier verifier = new MACVerifier(hexStringToByteArray(signalKey));
            SignedJWT signedJWT = SignedJWT.parse(authToken);
            
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            boolean verified = signedJWT.verify(verifier);

            if (verified && expiryTime.after(new Date())) {
                return true;
            }
        } catch (JOSEException | ParseException e) {
            log.error("Invalid JWT token", e);
        }
        return false;
    }

    private static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    | Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }
}