
package com.mycompany.rideapp.service;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mycompany.rideapp.dto.request.AuthenticationRequest;
import com.mycompany.rideapp.dto.request.IntroSpectRequest;
import com.mycompany.rideapp.dto.response.AuthenticationResponse;
import com.mycompany.rideapp.dto.response.IntroSpectResponse;
import com.mycompany.rideapp.entity.Driver;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.enums.Role;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.repository.DriverRepository;
import com.mycompany.rideapp.repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationService {
    UserRepository userRepository;
    DriverRepository driverRepository;
    PasswordEncoder passwordEncoder;
    @NonFinal
    @Value("${spring.security.oauth2.resourceserver.jwt.secret}")
    protected String signalKey;
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    private static final int DEFAULT_LENGTH = 12;
    private static final SecureRandom random = new SecureRandom();

    public AuthenticationResponse loginUser(AuthenticationRequest authenticationRequest) {
        User user = null;
        if (authenticationRequest.getEmail() != null) {
            user = userRepository.findByEmailWithRoles(authenticationRequest.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } else if (authenticationRequest.getUsername() != null) {
            user = userRepository.findByUserName(authenticationRequest.getUsername())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        boolean results = passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword());
        if (!results) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(user);
        return AuthenticationResponse.builder().authenticated(results).token(token).build();
    }

    @Transactional(readOnly = true)
    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        // Build JWT claims
        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.DAYS).toEpochMilli()))
                .claim("scope", buildScope(user))
                .claim("userId", user.getId())
                .claim("name", user.getName())
                .claim("imageUrl", user.getImageUrl());

        // If user is a driver, add driverId to JWT
        if (user.getRole() == Role.DRIVER) {
            driverRepository.findByUserId(user.getId()).ifPresent(driver -> {
                claimsBuilder.claim("driverId", driver.getId());
                log.info("Adding driverId to JWT: {}", driver.getId());
            });
        }

        JWTClaimsSet jwtClaimsSet = claimsBuilder.build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(hexStringToByteArray(signalKey)));
            return jwsObject.serialize();
        } catch (JOSEException args) {
            throw new AppException(ErrorCode.SIGNAL_KEY_NOT_VALID);
        }
    }

    public String generateTokenFromOAuth2(User user) {
        User loadedUser = userRepository.findByEmailWithRoles(user.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return generateToken(loadedUser);
    }

    public String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (user.getRole() != null) {
            stringJoiner.add("ROLE_" + user.getRole().name());
        }
        return stringJoiner.toString();
    }

    public IntroSpectResponse introspect(IntroSpectRequest request)
            throws JOSEException, ParseException {
        String token = request.getToken();

        JWSVerifier verifier = new MACVerifier(hexStringToByteArray(signalKey));

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        boolean verified = signedJWT.verify(verifier);

        return IntroSpectResponse.builder()
                .valid(verified && expiryTime.after(new Date()))
                .build();
    }

    /**
     * Converts a hex string to a byte array
     */
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