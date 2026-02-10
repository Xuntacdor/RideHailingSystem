package com.mycompany.rideapp.config;

import java.io.IOException;
import java.util.Arrays;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.mycompany.rideapp.security.TokenAuthenticationFilter;
import com.mycompany.rideapp.security.oauth2.OAuth2FailureHandler;
import com.mycompany.rideapp.security.oauth2.OAuth2SuccessHandler;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@FieldDefaults(level = AccessLevel.PRIVATE)

public class SecurityConfig {

        @Value("${spring.security.oauth2.resourceserver.jwt.secret}")

        String signalKey;

        @Value("${app.cors.allowed-origins}")

        String allowedOrigins;

        @Autowired

        OAuth2SuccessHandler oAuth2SuccessHandler;

        @Autowired

        OAuth2FailureHandler oAuth2FailureHandler;

        @Autowired
        TokenAuthenticationFilter tokenAuthenticationFilter;

        private static final String[] PUBLIC = {

                        "/api/v1/payos/**",

                        "/auth/**",

                        "/api/auth/**",

                        "/login/**",

                        "/oauth2/**",

                        // "/api/rides/**",

                        "/ws/**",

                        "/ws-raw/**",
                        
                        "/api/test/public"  // Allow public test endpoint

        };

        private static final String[] SWAGGER_PUBLIC_ENDPOINT = {

                        "/v3/api-docs/**",

                        "/swagger-ui/**",

                        "/swagger-ui.html"

        };

        @Bean

        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http

                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                                                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                                                .ignoringRequestMatchers(PUBLIC))

                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))// thử
                                                                                                                   // sửa

                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(SWAGGER_PUBLIC_ENDPOINT).permitAll()

                                                .requestMatchers(PUBLIC).permitAll()

                                                // .requestMatchers("/oauth2/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/users").permitAll()

                                                .anyRequest().authenticated()


                                )
                                .addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                // Commented out OAuth2 login configuration
                // .oauth2Login(oauth2 -> oauth2
                // .successHandler(oAuth2SuccessHandler)
                // .failureHandler(oAuth2FailureHandler)
                // )

                // .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
                // http.addFilterAfter(new OncePerRequestFilter(){
                // @Override
                // protected void doFilterInternal(HttpServletRequest
                // request,HttpServletResponse response, FilterChain filterChain)
                // throws ServletException, IOException{
                // CsrfToken csrfToken = (CsrfToken)
                // request.getAttribute(CsrfToken.class.getName());
                // if (csrfToken != null) {
                // csrfToken.getToken();

                // }
                // filterChain.doFilter(request, response);
                // }
                // },CsrfFilter.class);

                return http.build();

        }

        @Bean

        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                // configuration.setAllowedOrigins(Arrays.asList(

                // "http://localhost:3000", // React

                // "http://localhost:5173", // Vite

                // "http://localhost:4200" // Angular

                // ));

                configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));

                configuration.setAllowedMethods(Arrays.asList(

                                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"

                ));

                configuration.setAllowedHeaders(Arrays.asList(

                                "Authorization",

                                "Content-Type",

                                "Accept",

                                "X-Requested-With",

                                "x-xsrf-token"

                ));

                configuration.setAllowCredentials(true);

                // configuration.setMaxAge(3600L);

                configuration.setExposedHeaders(Arrays.asList(

                                "Authorization",

                                "Content-Disposition"

                ));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", configuration);

                return source;

        }

        @Bean

        public JwtDecoder jwtDecoder() {

                byte[] decodedKey = hexStringToByteArray(signalKey);

                SecretKeySpec secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "HmacSHA256");

                return NimbusJwtDecoder.withSecretKey(secretKey)

                                .macAlgorithm(MacAlgorithm.HS256)

                                .build();

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
