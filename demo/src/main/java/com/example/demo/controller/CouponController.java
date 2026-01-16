package com.example.demo.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.request.ApplyCouponRequest;
import com.example.demo.dto.request.CouponRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.CouponResponse;
import com.example.demo.service.CouponService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/coupon")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CouponController {
    CouponService couponService;

    @PostMapping
    public ApiResponse<CouponResponse> createCoupon(@RequestBody @Validated CouponRequest request) {
        log.info("Creating coupon with code: {}", request.getCode());
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.createCoupon(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CouponResponse> getCouponById(@PathVariable String id) {
        log.info("Getting coupon by ID: {}", id);
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.getCouponById(id))
                .build();
    }

    @GetMapping("/code/{code}")
    public ApiResponse<CouponResponse> getCouponByCode(@PathVariable String code) {
        log.info("Getting coupon by code: {}", code);
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.getCouponByCode(code))
                .build();
    }

    @PostMapping("/validate")
    public ApiResponse<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam String userId) {
        log.info("Validating coupon {} for user {}", code, userId);
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.validateCoupon(code, userId))
                .build();
    }

    @PostMapping("/apply")
    public ApiResponse<CouponResponse> applyCoupon(@RequestBody @Validated ApplyCouponRequest request) {
        log.info("Applying coupon {} for user {}", request.getCouponCode(), request.getUserId());
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.applyCoupon(request))
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<CouponResponse>> getUserCouponUsage(@PathVariable String userId) {
        log.info("Getting coupon usage for user: {}", userId);
        return ApiResponse.<List<CouponResponse>>builder()
                .code(200)
                .results(couponService.getUserCouponUsage(userId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<CouponResponse> updateCoupon(
            @PathVariable String id,
            @RequestBody @Validated CouponRequest request) {
        log.info("Updating coupon: {}", id);
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.updateCoupon(id, request))
                .build();
    }

    @PutMapping("/{id}/deactivate")
    public ApiResponse<CouponResponse> deactivateCoupon(@PathVariable String id) {
        log.info("Deactivating coupon: {}", id);
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.deactivateCoupon(id))
                .build();
    }

    @GetMapping("/active")
    public ApiResponse<List<CouponResponse>> getActiveCoupons() {
        log.info("Getting all active coupons");
        return ApiResponse.<List<CouponResponse>>builder()
                .code(200)
                .results(couponService.getActiveCoupons())
                .build();
    }
}
