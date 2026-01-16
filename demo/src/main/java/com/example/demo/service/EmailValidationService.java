package com.example.demo.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EmailValidationService {
    private final RedisTemplate<String, String> redisTemplate;
    private static final long CODE_EXPIRE_TIME = 10;
    
    public void saveValidateCode(String email, String code){
        String key = "email:validation: " + email;
        redisTemplate.opsForValue().set(key, code, CODE_EXPIRE_TIME);
    }

    public String getValidateCode(String email)
    {
        return redisTemplate.opsForValue().get("email:validation: " + email);
    }

    public boolean validateCode(String email, String code)
    {
        String storageCode = getValidateCode(email);
        return storageCode != null && storageCode.equals(code);
    }

    public void deleteValidationCode(String email)
    {
        String key = "email:validation: "+ email;
        redisTemplate.delete(key);
    }
}
