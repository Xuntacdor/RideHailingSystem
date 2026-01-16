package com.example.demo.config;


import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
//Catch HTTP request and print it in console
//Debug purpose
public class LoggingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        String url = request.getRequestURI();      // vd: /api/users
        String query = request.getQueryString();   // vd: name=abc&age=20

        if (query != null) {
            log.info("Incoming request: {} {}?{}", request.getMethod(), url, query);
        } else {
            log.info("Incoming request: {} {}", request.getMethod(), url);
        }

        return true; 
    }
}