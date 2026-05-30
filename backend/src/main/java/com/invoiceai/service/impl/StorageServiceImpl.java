package com.invoiceai.service.impl;

import com.invoiceai.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Slf4j
@Service
public class StorageServiceImpl implements StorageService {

    private final Path rootLocation;

    public StorageServiceImpl(@Value("${storage.local-path}") String storagePath) {
        this.rootLocation = Paths.get(storagePath);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create storage directory: " + storagePath, e);
        }
    }

    @Override
    public String store(MultipartFile file, String invoiceId) throws Exception {
        String ext       = getExtension(file.getOriginalFilename());
        String filename  = invoiceId + "_" + UUID.randomUUID() + ext;
        Path   target    = rootLocation.resolve(filename);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        log.info("Stored invoice file: {}", target);
        return target.toString();
    }

    @Override
    public void delete(String storagePath) {
        if (storagePath == null) return;
        try {
            Files.deleteIfExists(Paths.get(storagePath));
        } catch (IOException e) {
            log.warn("Could not delete file: {}", storagePath, e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
