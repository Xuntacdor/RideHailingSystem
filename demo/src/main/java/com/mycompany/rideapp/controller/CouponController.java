package com.mycompany.rideapp.controller;

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

import com.mycompany.rideapp.dto.request.ApplyCouponRequest;
import com.mycompany.rideapp.dto.request.CouponRequest;
import com.mycompany.rideapp.dto.response.ApiResponse;
import com.mycompany.rideapp.dto.response.CouponResponse;
import com.mycompany.rideapp.service.AchievementService;
import com.mycompany.rideapp.service.CouponService;

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
    AchievementService achievementService;

    @PostMapping
    public ApiResponse<CouponResponse> createCoupon(@RequestBody @Validated CouponRequest request) {
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.createCoupon(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CouponResponse> getCouponById(@PathVariable String id) {
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.getCouponById(id))
                .build();
    }

    @GetMapping("/code/{code}")
    public ApiResponse<CouponResponse> getCouponByCode(@PathVariable String code) {
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.getCouponByCode(code))
                .build();
    }

    @PostMapping("/validate")
    public ApiResponse<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam String userId) {
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.validateCoupon(code, userId))
                .build();
    }

    @PostMapping("/apply")
    public ApiResponse<CouponResponse> applyCoupon(@RequestBody @Validated ApplyCouponRequest request) {
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.applyCoupon(request))
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<CouponResponse>> getUserCouponUsage(@PathVariable String userId) {
        return ApiResponse.<List<CouponResponse>>builder()
                .code(200)
                .results(couponService.getUserCouponUsage(userId))
                .build();
    }

    @GetMapping("/user/{userId}/available")
    public ApiResponse<List<CouponResponse>> getUserAvailableCoupons(@PathVariable String userId) {
        return ApiResponse.<List<CouponResponse>>builder()
                .code(200)
                .results(couponService.getUserAvailableCoupons(userId))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<CouponResponse> updateCoupon(
            @PathVariable String id,
            @RequestBody @Validated CouponRequest request) {
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.updateCoupon(id, request))
                .build();
    }

    @PutMapping("/{id}/deactivate")

    public ApiResponse<CouponResponse> deactivateCoupon(@PathVariable String id) {
        return ApiResponse.<CouponResponse>builder()
                .code(200)
                .results(couponService.deactivateCoupon(id))
                .build();
    }

    @GetMapping("/active")
    public ApiResponse<List<CouponResponse>> getActiveCoupons() {
        return ApiResponse.<List<CouponResponse>>builder()
                .code(200)
                .results(couponService.getActiveCoupons())
                .build();
    }

    @PostMapping("/admin/assign")
    public ApiResponse<String> assignCouponToUser(
            @RequestParam String userId,
            @RequestParam String couponId) {
        achievementService.assignCouponToUser(userId, couponId);
        return ApiResponse.<String>builder()
                .code(200)
                .message("Coupon assigned successfully")
                .build();
    }
}
