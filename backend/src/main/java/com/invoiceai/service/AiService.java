package com.invoiceai.service;

import com.invoiceai.dto.response.AiExtractionResult;
import com.invoiceai.model.Invoice;

public interface AiService {
    /** Parse OCR text and return structured invoice fields. */
    AiExtractionResult extractFields(String ocrText);

    /** Generate a one-sentence status summary for a processed invoice. */
    String generateSummary(Invoice invoice);

    /** Return an anomaly description if the invoice amount is unusual, else null. */
    String detectAnomaly(Invoice invoice, double vendorAvgAmount);
}
