package com.execflow.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * Persists the given file under the given subdirectory (e.g. a
     * "{userId}/{inputId}" path) and returns metadata about where it landed.
     */
    StoredFile store(MultipartFile file, String subdirectory);

    /** Loads a previously stored file as a streamable Resource. */
    Resource load(String storagePath);

    /** Deletes a previously stored file. No-op if it doesn't exist. */
    void delete(String storagePath);

    record StoredFile(String storagePath, String originalFileName, long sizeBytes) {
    }
}
