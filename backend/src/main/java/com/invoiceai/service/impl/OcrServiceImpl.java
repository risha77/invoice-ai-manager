package com.invoiceai.service.impl;

import com.invoiceai.service.OcrService;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;

@Service
public class OcrServiceImpl implements OcrService {

    private final Tesseract tesseract;

    public OcrServiceImpl(
            @Value("${tesseract.data-path}") String dataPath,
            @Value("${tesseract.language}")  String language) {
        this.tesseract = new Tesseract();
        this.tesseract.setDatapath(dataPath);
        this.tesseract.setLanguage(language);
        // Improve accuracy for invoice text
        this.tesseract.setPageSegMode(6);
    }

    @Override
    public String extractText(MultipartFile file) throws Exception {
        String contentType = file.getContentType();

        if ("application/pdf".equals(contentType)) {
            return extractFromPdf(file);
        }
        return extractFromImage(file);
    }

    private String extractFromPdf(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream();
             PDDocument doc = PDDocument.load(is)) {

            PDFRenderer renderer = new PDFRenderer(doc);
            StringBuilder sb = new StringBuilder();

            for (int page = 0; page < Math.min(doc.getNumberOfPages(), 3); page++) {
                // 300 DPI gives good OCR accuracy
                BufferedImage img = renderer.renderImageWithDPI(page, 300);
                img = preprocessImage(img);
                sb.append(tesseract.doOCR(img)).append("\n");
            }
            return sb.toString().trim();
        }
    }

    private String extractFromImage(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream()) {
            BufferedImage img = ImageIO.read(is);
            if (img == null) throw new IllegalArgumentException("Cannot read image file");
            img = preprocessImage(img);
            return tesseract.doOCR(img);
        }
    }

    /**
     * Convert to grayscale and boost contrast — significantly improves OCR accuracy
     * on scanned/photographed invoices.
     */
    private BufferedImage preprocessImage(BufferedImage src) {
        BufferedImage gray = new BufferedImage(src.getWidth(), src.getHeight(),
                                              BufferedImage.TYPE_BYTE_GRAY);
        gray.getGraphics().drawImage(src, 0, 0, null);
        return gray;
    }
}
