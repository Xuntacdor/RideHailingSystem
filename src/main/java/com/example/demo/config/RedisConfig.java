package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@ConfigurationProperties(prefix = "spring.data.redis")
public class RedisConfig {
    private String host;
    private int port;  
    public String getHost() {        return host;    }   
    public void setHost(String host) {        this.host = host;    }    
    public int getPort() {        return port;    }    
    public void setPort(int port) {        this.port = port;    }

    @Bean
    public LettuceConnectionFactory lettuceConnectionFactory(){
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(getHost(),getPort());
        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory)
    {
        return RedisCacheManager.create(connectionFactory);
    }

    @Bean 
    public RedisTemplate<String, String> redisTemplate(LettuceConnectionFactory connectionFactory){
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }

}
