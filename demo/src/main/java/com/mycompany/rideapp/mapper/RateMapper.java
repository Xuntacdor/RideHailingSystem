
package com.mycompany.rideapp.mapper;

import org.springframework.stereotype.Component;

import com.mycompany.rideapp.dto.request.RateRequest;
import com.mycompany.rideapp.dto.response.RateResponse;
import com.mycompany.rideapp.entity.Rate;
import com.mycompany.rideapp.entity.User;

@Component
public class RateMapper {

    public static Rate toEntity(RateRequest request, User user, User ratedUser) {
        if (request == null)
            return null;
        return Rate.builder()
                .user(user)
                .ratedUser(ratedUser)
                .star(request.getStar())
                .comment(request.getComment())
                .build();
    }

    public static RateResponse toResponse(Rate rate) {
        if (rate == null)
            return null;
        return RateResponse.builder()
                .id(rate.getId())
                .userId(rate.getUser() != null ? rate.getUser().getId() : null)
                .userName(rate.getUser() != null ? rate.getUser().getName() : null)
                .ratedUserId(rate.getRatedUser() != null ? rate.getRatedUser().getId() : null)
                .ratedUserName(rate.getRatedUser() != null ? rate.getRatedUser().getName() : null)
                .star(rate.getStar())
                .comment(rate.getComment())
                .build();
    }

    public static void updateEntity(Rate rate, RateRequest request) {
        if (rate == null || request == null)
            return;
        if (request.getStar() != null) {
            rate.setStar(request.getStar());
        }
        if (request.getComment() != null) {
            rate.setComment(request.getComment());
        }
    }
}
