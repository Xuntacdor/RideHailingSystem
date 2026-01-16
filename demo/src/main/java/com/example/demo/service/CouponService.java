
package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.request.ApplyCouponRequest;
import com.example.demo.dto.request.CouponRequest;
import com.example.demo.dto.response.CouponResponse;
import com.example.demo.entity.Coupon;
import com.example.demo.entity.CouponUsage;
import com.example.demo.entity.User;
import com.example.demo.exception.AppException;
import com.example.demo.exception.ErrorCode;
import com.example.demo.mapper.CouponMapper;
import com.example.demo.repository.CouponRepository;
import com.example.demo.repository.CouponUsageRepository;
import com.example.demo.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CouponService {
    CouponRepository couponRepository;
    CouponUsageRepository couponUsageRepository;
    UserRepository userRepository;

    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Coupon coupon = CouponMapper.toEntity(request);
        couponRepository.save(coupon);

        log.info("Coupon created with code: {}", coupon.getCode());
        return CouponMapper.toResponse(coupon);
    }

    public CouponResponse getCouponById(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return CouponMapper.toResponse(coupon);
    }

    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return CouponMapper.toResponse(coupon);
    }

    public CouponResponse validateCoupon(String code, String userId) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        validateCouponRules(coupon, userId);

        log.info("Coupon {} is valid for user {}", code, userId);
        return CouponMapper.toResponse(coupon);
    }

    public CouponResponse applyCoupon(ApplyCouponRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Coupon coupon = couponRepository.findByCode(request.getCouponCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        validateCouponRules(coupon, request.getUserId());

        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .user(user)
                .usedAt(LocalDateTime.now())
                .rideId(request.getRideId())
                .build();

        couponUsageRepository.save(usage);

        coupon.setCurrentUsageCount(coupon.getCurrentUsageCount() + 1);
        couponRepository.save(coupon);

        log.info("Coupon {} applied successfully for user {}", request.getCouponCode(), request.getUserId());
        return CouponMapper.toResponse(coupon);
    }

    private void validateCouponRules(Coupon coupon, String userId) {
        if (!coupon.getIsActive()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        if (coupon.getExpirationDate() != null && LocalDateTime.now().isAfter(coupon.getExpirationDate())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        if (coupon.getMaxUsageLimit() != null &&
                coupon.getCurrentUsageCount() >= coupon.getMaxUsageLimit()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Long userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
        if (coupon.getUsagePerUser() != null && userUsageCount >= coupon.getUsagePerUser()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
    }

    public List<CouponResponse> getUserCouponUsage(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return couponUsageRepository.findByUserId(userId).stream()
                .map(usage -> CouponMapper.toResponse(usage.getCoupon()))
                .collect(Collectors.toList());
    }

    public CouponResponse updateCoupon(String id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getCode() != null && !request.getCode().equals(coupon.getCode())) {
            if (couponRepository.findByCode(request.getCode()).isPresent()) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
        }

        CouponMapper.updateEntity(coupon, request);
        couponRepository.save(coupon);

        log.info("Coupon {} updated successfully", id);
        return CouponMapper.toResponse(coupon);
    }

    public CouponResponse deactivateCoupon(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        coupon.setIsActive(false);
        couponRepository.save(coupon);

        log.info("Coupon {} deactivated", id);
        return CouponMapper.toResponse(coupon);
    }

    public List<CouponResponse> getActiveCoupons() {
        return couponRepository.findByIsActiveTrue().stream()
                .map(CouponMapper::toResponse)
                .collect(Collectors.toList());
    }
}
