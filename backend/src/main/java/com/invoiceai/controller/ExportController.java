package com.invoiceai.controller;

import com.invoiceai.service.ExportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    /**
     * GET /api/export/csv
     * Streams a CSV file of all invoices.
     */
    @GetMapping("/csv")
    public void exportCsv(HttpServletResponse response) throws Exception {
        String filename = "invoices_" + LocalDate.now() + ".csv";
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        exportService.writeCsv(response.getWriter());
    }

    /**
     * GET /api/export/pdf
     * Streams a formatted PDF report.
     */
    @GetMapping("/pdf")
    public void exportPdf(HttpServletResponse response) throws Exception {
        String filename = "invoices_" + LocalDate.now() + ".pdf";
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        exportService.writePdf(response.getOutputStream());
    }
}
