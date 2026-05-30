package com.invoiceai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class InvoiceStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "PENDING|PAID|OVERDUE|PROCESSING",
             message = "Status must be PENDING, PAID, OVERDUE, or PROCESSING")
    private String status;
}
