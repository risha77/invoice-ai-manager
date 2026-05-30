package com.invoiceai.service;

import org.springframework.web.multipart.MultipartFile;

public interface OcrService {
    /** Extract raw text from a PDF or image file using Tesseract. */
    String extractText(MultipartFile file) throws Exception;
}
