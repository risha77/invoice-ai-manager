package com.invoiceai.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AiExtractionResult {
    private String     vendor;
    private BigDecimal amount;
    private String     currency   = "INR";
    private String     invoiceDate;
    private String     dueDate;
    private String     category   = "OTHER";
    private String     invoiceNumber;
}
