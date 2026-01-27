
package com.mycompany.rideapp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.mycompany.rideapp.dto.request.RateRequest;
import com.mycompany.rideapp.dto.response.RateResponse;
import com.mycompany.rideapp.entity.Rate;
import com.mycompany.rideapp.entity.User;
import com.mycompany.rideapp.exception.AppException;
import com.mycompany.rideapp.exception.ErrorCode;
import com.mycompany.rideapp.mapper.RateMapper;
import com.mycompany.rideapp.repository.RateRepository;
import com.mycompany.rideapp.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RateService {
    RateRepository rateRepository;
    UserRepository userRepository;

    public RateResponse createRating(RateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        User ratedUser = userRepository.findById(request.getRatedUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getUserId().equals(request.getRatedUserId())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Rate rate = RateMapper.toEntity(request, user, ratedUser);
        rateRepository.save(rate);

        log.info("Rating created: User {} rated User {} with {} stars", request.getUserId(), request.getRatedUserId(),
                request.getStar());
        return RateMapper.toResponse(rate);
    }

    public RateResponse getRatingById(String id) {
        Rate rate = rateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        log.info("Getting rating by ID: {}", id);
        return RateMapper.toResponse(rate);
    }

    public List<RateResponse> getRatingsGivenByUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        log.info("Getting ratings given by user: {}", userId);
        return rateRepository.findByUserId(userId).stream()
                .map(RateMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<RateResponse> getRatingsReceivedByUser(String ratedUserId) {
        if (!userRepository.existsById(ratedUserId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        
        return rateRepository.findByRatedUserId(ratedUserId).stream()
                .map(RateMapper::toResponse)
                .collect(Collectors.toList());
    }

    public RateResponse updateRating(String id, RateRequest request) {
        Rate rate = rateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        RateMapper.updateEntity(rate, request);
        rateRepository.save(rate);

        log.info("Rating updated with ID: {}", id);
        return RateMapper.toResponse(rate);
    }

    public void deleteRating(String id) {
        if (!rateRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        rateRepository.deleteById(id);
        log.info("Rating deleted with ID: {}", id);
    }

    public Double getAverageRating(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Double average = rateRepository.calculateAverageRatingByRatedUserId(userId);
        log.info("Getting average rating for user: {}", userId);
        return average != null ? average : 0.0;
    }
}
