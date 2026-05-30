package com.invoiceai.dto.response;

import com.invoiceai.model.Invoice;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class InvoiceResponse {

    private String        id;
    private String        vendor;
    private BigDecimal    amount;
    private String        currency;
    private LocalDate     invoiceDate;
    private LocalDate     dueDate;
    private String        category;
    private String        invoiceNumber;
    private String        status;
    private String        aiSummary;
    private String        anomaly;
    private String        fileName;
    private LocalDateTime uploadedAt;
    private long          daysOverdue;

    public static InvoiceResponse from(Invoice inv) {
        long days = 0;
        if (inv.getDueDate() != null) {
            days = java.time.temporal.ChronoUnit.DAYS.between(
                inv.getDueDate(), LocalDate.now());
        }
        return InvoiceResponse.builder()
                .id(inv.getId())
                .vendor(inv.getVendor())
                .amount(inv.getAmount())
                .currency(inv.getCurrency())
                .invoiceDate(inv.getInvoiceDate())
                .dueDate(inv.getDueDate())
                .category(inv.getCategory())
                .invoiceNumber(inv.getInvoiceNumber())
                .status(inv.getStatus())
                .aiSummary(inv.getAiSummary())
                .anomaly(inv.getAnomaly())
                .fileName(inv.getFileName())
                .uploadedAt(inv.getUploadedAt())
                .daysOverdue(Math.max(0, days))
                .build();
    }
}
