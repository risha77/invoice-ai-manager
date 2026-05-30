package com.invoiceai.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /** Store file and return the storage path. */
    String store(MultipartFile file, String invoiceId) throws Exception;

    /** Delete stored file by path. */
    void delete(String storagePath);
}
