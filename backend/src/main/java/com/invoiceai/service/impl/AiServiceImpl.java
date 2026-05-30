package com.invoiceai.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoiceai.dto.response.AiExtractionResult;
import com.invoiceai.model.Invoice;
import com.invoiceai.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    @Value("${claude.api-key}")
    private String apiKey;

    @Value("${claude.model}")
    private String model;

    @Value("${claude.max-tokens}")
    private int maxTokens;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .callTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    // ── Field extraction ────────────────────────────────────────────────────

    private static final String EXTRACTION_SYSTEM = """
            You are a precise invoice parser. Return ONLY valid JSON with no markdown, no explanation.
            Schema (use null for any missing field):
            {
              "vendor":        "string|null",
              "amount":        "number|null",
              "currency":      "INR",
              "invoiceDate":   "YYYY-MM-DD|null",
              "dueDate":       "YYYY-MM-DD|null",
              "category":      "SAAS|UTILITIES|SERVICES|RENT|TRAVEL|OTHER",
              "invoiceNumber": "string|null"
            }
            """;

    @Override
    public AiExtractionResult extractFields(String ocrText) {
        String prompt = "Parse this invoice OCR text:\n\n" + ocrText;
        String raw = callClaude(EXTRACTION_SYSTEM, prompt, 400);

        try {
            String json = raw.replaceAll("```json|```", "").trim();
            return mapper.readValue(json, AiExtractionResult.class);
        } catch (Exception e) {
            log.warn("AI extraction parse failed, returning defaults. Raw: {}", raw, e);
            AiExtractionResult result = new AiExtractionResult();
            result.setCurrency("INR");
            result.setCategory("OTHER");
            return result;
        }
    }

    // ── Summary generation ──────────────────────────────────────────────────

    private static final String SUMMARY_SYSTEM = """
            You are a finance dashboard assistant.
            Write exactly ONE sentence (max 18 words) summarising the invoice status.
            Be direct and professional. No emojis.
            """;

    @Override
    public String generateSummary(Invoice invoice) {
        long days = 0;
        if (invoice.getDueDate() != null) {
            days = ChronoUnit.DAYS.between(invoice.getDueDate(), LocalDate.now());
        }
        String prompt = String.format(
            "Vendor: %s | Amount: %s %s | Due: %s | Status: %s | DaysOverdue: %d",
            invoice.getVendor(), invoice.getCurrency(), invoice.getAmount(),
            invoice.getDueDate(), invoice.getStatus(), Math.max(0, days)
        );
        return callClaude(SUMMARY_SYSTEM, prompt, 80);
    }

    // ── Anomaly detection ───────────────────────────────────────────────────

    private static final String ANOMALY_SYSTEM = """
            You are a financial anomaly detector.
            Write ONE short alert sentence (max 15 words). Direct, no emojis.
            """;

    @Override
    public String detectAnomaly(Invoice invoice, double vendorAvg) {
        if (invoice.getAmount() == null || vendorAvg == 0) return null;
        double pct = ((invoice.getAmount().doubleValue() / vendorAvg) - 1) * 100;
        String prompt = String.format(
            "Invoice amount %.0f INR is %.0f%% above the average of %.0f INR for vendor %s.",
            invoice.getAmount().doubleValue(), pct, vendorAvg, invoice.getVendor()
        );
        return callClaude(ANOMALY_SYSTEM, prompt, 60);
    }

    // ── Core HTTP transport ─────────────────────────────────────────────────

    private String callClaude(String systemPrompt, String userPrompt, int maxTok) {
        try {
            Map<String, Object> body = Map.of(
                "model",      model,
                "max_tokens", maxTok,
                "system",     systemPrompt,
                "messages",   List.of(Map.of("role", "user", "content", userPrompt))
            );

            RequestBody requestBody = RequestBody.create(
                mapper.writeValueAsString(body),
                MediaType.get("application/json")
            );

            Request request = new Request.Builder()
                .url("https://api.anthropic.com/v1/messages")
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .post(requestBody)
                .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful() || response.body() == null) {
                    log.error("Claude API error: {}", response.code());
                    return "";
                }
                Map<?, ?> resp = mapper.readValue(response.body().string(), Map.class);
                List<?> content = (List<?>) resp.get("content");
                if (content == null || content.isEmpty()) return null;
                Map<?, ?> first = (Map<?, ?>) content.get(0);
                return (String) first.getOrDefault("text", null);
            }
        } catch (Exception e) {
            log.error("Claude API call failed", e);
            return "";
        }
    }
}
