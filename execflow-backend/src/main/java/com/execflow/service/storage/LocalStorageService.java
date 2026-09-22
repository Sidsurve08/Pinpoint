package com.execflow.service.storage;

import com.execflow.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private final Path basePath;

    public LocalStorageService(@Value("${execflow.storage.local.base-path}") String basePathConfig) {
        this.basePath = Paths.get(basePathConfig).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.basePath);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create storage directory: " + this.basePath, e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file, String subdirectory) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file is empty");
        }

        String originalName = sanitizeFileName(file.getOriginalFilename());
        String extension = extractExtension(originalName);
        String storedFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = basePath.resolve(subdirectory).normalize();
        // Guard against a subdirectory value that could escape basePath
        // (e.g. via ".." segments) before touching the filesystem.
        if (!targetDir.startsWith(basePath)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid storage path");
        }

        try {
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(storedFileName);
            file.transferTo(targetFile);

            String relativePath = basePath.relativize(targetFile).toString();
            return new StoredFile(relativePath, originalName, file.getSize());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store uploaded file");
        }
    }

    @Override
    public Resource load(String storagePath) {
        try {
            Path file = basePath.resolve(storagePath).normalize();
            if (!file.startsWith(basePath)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid storage path");
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Stored file not found");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to load stored file");
        }
    }

    @Override
    public void delete(String storagePath) {
        try {
            Path file = basePath.resolve(storagePath).normalize();
            if (!file.startsWith(basePath)) {
                return;
            }
            Files.deleteIfExists(file);
        } catch (IOException e) {
            // Deletion best-effort - an orphaned file on disk isn't worth
            // failing the request over (e.g. during input deletion).
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "upload";
        }
        // Strip any path components a malicious client might send.
        return Paths.get(fileName).getFileName().toString();
    }

    private String extractExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 && dot < fileName.length() - 1 ? fileName.substring(dot + 1).toLowerCase() : "";
    }
}
