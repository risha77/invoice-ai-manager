package com.invoiceai.controller;

import com.invoiceai.dto.request.InvoiceSearchRequest;
import com.invoiceai.dto.request.InvoiceStatusUpdateRequest;
import com.invoiceai.dto.response.InvoiceResponse;
import com.invoiceai.dto.response.PagedResponse;
import com.invoiceai.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * POST /api/invoices
     * Upload invoice file → OCR → AI extraction → save → return DTO.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InvoiceResponse> upload(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        InvoiceResponse response = invoiceService.uploadAndProcess(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/invoices?q=&status=&category=&vendor=&page=&size=&sortBy=&sortDir=
     */
    @GetMapping
    public ResponseEntity<PagedResponse<InvoiceResponse>> search(
            @ModelAttribute InvoiceSearchRequest req) {
        return ResponseEntity.ok(invoiceService.search(req));
    }

    /**
     * GET /api/invoices/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    /**
     * PATCH /api/invoices/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody InvoiceStatusUpdateRequest req) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, req.getStatus()));
    }

    /**
     * DELETE /api/invoices/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
