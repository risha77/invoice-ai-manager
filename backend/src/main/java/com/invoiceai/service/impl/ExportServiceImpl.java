package com.invoiceai.service.impl;

import com.invoiceai.model.Invoice;
import com.invoiceai.repository.InvoiceRepository;
import com.invoiceai.service.ExportService;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final InvoiceRepository invoiceRepository;

    // ── CSV ──────────────────────────────────────────────────────────────────

    private static final String[] CSV_HEADERS = {
        "ID", "Vendor", "Invoice #", "Amount", "Currency",
        "Invoice Date", "Due Date", "Category", "Status",
        "AI Summary", "Anomaly", "Uploaded At"
    };

    @Override
    public void writeCsv(Writer writer) throws Exception {
        List<Invoice> invoices = invoiceRepository.findAll();
        try (CSVPrinter csv = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(CSV_HEADERS))) {
            for (Invoice inv : invoices) {
                csv.printRecord(
                    inv.getId(),
                    inv.getVendor(),
                    inv.getInvoiceNumber(),
                    inv.getAmount(),
                    inv.getCurrency(),
                    inv.getInvoiceDate(),
                    inv.getDueDate(),
                    inv.getCategory(),
                    inv.getStatus(),
                    inv.getAiSummary(),
                    inv.getAnomaly(),
                    inv.getUploadedAt()
                );
            }
        }
    }

    // ── PDF ──────────────────────────────────────────────────────────────────

    @Override
    public void writePdf(OutputStream out) throws Exception {
        List<Invoice> invoices = invoiceRepository.findAll();

        PdfWriter   writer   = new PdfWriter(out);
        PdfDocument pdfDoc   = new PdfDocument(writer);
        Document    document = new Document(pdfDoc);

        // Title
        document.add(new Paragraph("Invoice Report")
                .setFontSize(20).setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4));
        document.add(new Paragraph("Generated: " + java.time.LocalDateTime.now())
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(16));

        // Table
        Table table = new Table(UnitValue.createPercentArray(
                new float[]{15, 12, 10, 8, 12, 10, 15}))
                .useAllAvailableWidth();

        String[] cols = {"Vendor", "Invoice #", "Amount", "Status", "Due Date", "Category", "AI Summary"};
        for (String col : cols) {
            table.addHeaderCell(new Cell().add(new Paragraph(col).setBold().setFontSize(8))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        }

        for (Invoice inv : invoices) {
            table.addCell(cell(inv.getVendor()));
            table.addCell(cell(inv.getInvoiceNumber()));
            table.addCell(cell(inv.getAmount() != null ? inv.getCurrency() + " " + inv.getAmount() : "—"));
            table.addCell(cell(inv.getStatus()));
            table.addCell(cell(inv.getDueDate() != null ? inv.getDueDate().toString() : "—"));
            table.addCell(cell(inv.getCategory()));
            table.addCell(cell(inv.getAiSummary()));
        }

        document.add(table);
        document.close();
    }

    private Cell cell(String text) {
        return new Cell().add(new Paragraph(text != null ? text : "—").setFontSize(8));
    }
}
