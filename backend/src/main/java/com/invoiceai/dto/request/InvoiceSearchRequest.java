package com.invoiceai.dto.request;

import lombok.Data;

@Data
public class InvoiceSearchRequest {
    private String q;
    private String vendor;
    private String status;
    private String category;
    private int page = 0;
    private int size = 20;
    private String sortBy   = "uploadedAt";
    private String sortDir  = "desc";
}
