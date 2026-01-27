package com.mycompany.rideapp.mapper;

import org.mapstruct.Mapper;

import com.mycompany.rideapp.dto.request.BookingTypeRequest;
import com.mycompany.rideapp.dto.response.BookingTypeResponse;
import com.mycompany.rideapp.entity.BookingType;

@Mapper(componentModel = "spring")
public interface BookingTypeMapper {

    BookingType toEntity(BookingTypeRequest request);

    BookingTypeResponse toResponse(BookingType entity);
}
