package com.example.demo.mapper;

import org.mapstruct.Mapper;

import com.example.demo.dto.request.BookingTypeRequest;
import com.example.demo.dto.response.BookingTypeResponse;
import com.example.demo.entity.BookingType;

@Mapper(componentModel = "spring")
public interface BookingTypeMapper {

    BookingType toEntity(BookingTypeRequest request);

    BookingTypeResponse toResponse(BookingType entity);
}
