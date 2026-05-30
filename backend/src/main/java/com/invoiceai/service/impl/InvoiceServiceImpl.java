package com.invoiceai.service.impl;

import com.invoiceai.dto.request.InvoiceSearchRequest;
import com.invoiceai.dto.response.AiExtractionResult;
import com.invoiceai.dto.response.InvoiceResponse;
import com.invoiceai.dto.response.PagedResponse;
import com.invoiceai.exception.ResourceNotFoundException;
import com.invoiceai.model.Invoice;
import com.invoiceai.repository.InvoiceRepository;
import com.invoiceai.service.*;
import com.invoiceai.util.InvoiceUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OcrService        ocrService;
    private final AiService         aiService;
    private final StorageService    storageService;

    // ── Upload & process ─────────────────────────────────────────────────────

    @Override
    public InvoiceResponse uploadAndProcess(MultipartFile file) {
        String invoiceId = UUID.randomUUID().toString();
        log.info("Processing invoice upload: {} id={}", file.getOriginalFilename(), invoiceId);

        // 1. Store raw file
        String storagePath = null;
        try {
            storagePath = storageService.store(file, invoiceId);
        } catch (Exception e) {
            log.warn("File storage failed (non-fatal): {}", e.getMessage());
        }

        // 2. OCR
        String ocrText = "";
        try {
            ocrText = ocrService.extractText(file);
            log.debug("OCR extracted {} chars for invoice {}", ocrText.length(), invoiceId);
        } catch (Exception e) {
            log.error("OCR failed for invoice {}", invoiceId, e);
        }

        // 3. AI field extraction
        AiExtractionResult fields = aiService.extractFields(ocrText);

        // 4. Build entity
        Invoice invoice = Invoice.builder()
                .id(invoiceId)
                .vendor(fields.getVendor())
                .amount(fields.getAmount())
                .currency(fields.getCurrency() != null ? fields.getCurrency() : "INR")
                .invoiceDate(InvoiceUtils.parseDate(fields.getInvoiceDate()))
                .dueDate(InvoiceUtils.parseDate(fields.getDueDate()))
                .category(fields.getCategory() != null ? fields.getCategory() : "OTHER")
                .invoiceNumber(fields.getInvoiceNumber())
                .status(InvoiceUtils.deriveStatus(InvoiceUtils.parseDate(fields.getDueDate())))
                .rawOcrText(ocrText)
                .fileName(file.getOriginalFilename())
                .fileStoragePath(storagePath)
                .build();

        // 5. AI summary
        try {
            invoice.setAiSummary(aiService.generateSummary(invoice));
        } catch (Exception e) {
            log.warn("AI summary generation failed: {}", e.getMessage());
        }

        // 6. Anomaly detection
        try {
            if (invoice.getVendor() != null && invoice.getAmount() != null) {
                List<Invoice> peers = invoiceRepository.findByVendorExcluding(invoice.getVendor(), invoiceId);
                if (peers.size() >= 2) {
                    double avg = peers.stream()
                            .mapToDouble(i -> i.getAmount() != null ? i.getAmount().doubleValue() : 0)
                            .average().orElse(0);
                    if (avg > 0 && invoice.getAmount().doubleValue() > avg * 1.5) {
                        invoice.setAnomaly(aiService.detectAnomaly(invoice, avg));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Anomaly detection failed: {}", e.getMessage());
        }

        // 7. Persist
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice saved: id={} vendor={} status={}", saved.getId(), saved.getVendor(), saved.getStatus());
        return InvoiceResponse.from(saved);
    }

    // ── Search ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InvoiceResponse> search(InvoiceSearchRequest req) {
        Sort sort = req.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(req.getSortBy()).ascending()
                : Sort.by(req.getSortBy()).descending();
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);

        String q        = blankToNull(req.getQ());
        String status   = blankToNull(req.getStatus());
        String category = blankToNull(req.getCategory());
        String vendor   = blankToNull(req.getVendor());

        Page<Invoice> page = invoiceRepository.search(q, status, category, vendor, pageable);
        List<InvoiceResponse> content = page.getContent().stream()
                .map(InvoiceResponse::from)
                .toList();

        return new PagedResponse<>(content, page.getNumber(), page.getSize(),
                                   page.getTotalElements(), page.getTotalPages());
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getById(String id) {
        return InvoiceResponse.from(findOrThrow(id));
    }

    @Override
    public InvoiceResponse updateStatus(String id, String status) {
        Invoice invoice = findOrThrow(id);
        invoice.setStatus(status);
        return InvoiceResponse.from(invoiceRepository.save(invoice));
    }

    @Override
    public void delete(String id) {
        Invoice invoice = findOrThrow(id);
        storageService.delete(invoice.getFileStoragePath());
        invoiceRepository.delete(invoice);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Invoice findOrThrow(String id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
