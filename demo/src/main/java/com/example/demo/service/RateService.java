
package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.request.RateRequest;
import com.example.demo.dto.response.RateResponse;
import com.example.demo.entity.Rate;
import com.example.demo.entity.User;
import com.example.demo.exception.AppException;
import com.example.demo.exception.ErrorCode;
import com.example.demo.mapper.RateMapper;
import com.example.demo.repository.RateRepository;
import com.example.demo.repository.UserRepository;

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
        return RateMapper.toResponse(rate);
    }

    public List<RateResponse> getRatingsGivenByUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

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
        return average != null ? average : 0.0;
    }
}
