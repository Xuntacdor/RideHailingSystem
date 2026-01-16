package com.example.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.config.StorageProperties;
import com.example.demo.exception.AppException;
import com.example.demo.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageStorageService {

    private final StorageProperties storageProperties;

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");

    public String storeAvatar(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_ERROR); 
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED.contains(contentType)) {
            throw new AppException(ErrorCode.FILE_ERROR);
        }

        String ext = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> "";
        };

        String filename = "avatar-" + UUID.randomUUID() + ext;

        Path baseDir = Paths.get(storageProperties.getAvatarDir()).toAbsolutePath().normalize();
        Path userDir = baseDir.resolve(userId).normalize();

        try {
            Files.createDirectories(userDir);

            Path target = userDir.resolve(filename).normalize();
            if (!target.startsWith(userDir)) {
                throw new AppException(ErrorCode.FILE_ERROR);
            }

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "http://localhost:80/Img/avatar"+ "/"+ userId + "/" + filename;
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_ERROR);
        }
    }
}