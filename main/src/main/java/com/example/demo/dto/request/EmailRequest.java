package com.example.demo.dto.request;
 
import lombok.Data;
 
@Data
public class EmailRequest {
    private String email;
    private String description;
}