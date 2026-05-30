package com.invoiceai.service;

import com.invoiceai.dto.request.InvoiceSearchRequest;
import com.invoiceai.dto.response.InvoiceResponse;
import com.invoiceai.dto.response.PagedResponse;
import org.springframework.web.multipart.MultipartFile;

public interface InvoiceService {
    InvoiceResponse uploadAndProcess(MultipartFile file);
    PagedResponse<InvoiceResponse> search(InvoiceSearchRequest req);
    InvoiceResponse getById(String id);
    InvoiceResponse updateStatus(String id, String status);
    void delete(String id);
}
