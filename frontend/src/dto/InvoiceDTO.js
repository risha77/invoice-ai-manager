/** Factory – creates a blank InvoiceDTO with sensible defaults. */
export function createInvoiceDTO(overrides = {}) {
  return {
    id:            overrides.id            ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    vendor:        overrides.vendor        ?? null,
    amount:        overrides.amount        ?? null,
    currency:      overrides.currency      ?? "INR",
    invoiceDate:   overrides.invoiceDate   ?? null,
    dueDate:       overrides.dueDate       ?? null,
    category:      overrides.category      ?? "OTHER",
    invoiceNumber: overrides.invoiceNumber ?? null,
    status:        overrides.status        ?? "PENDING",
    rawOcrText:    overrides.rawOcrText    ?? null,
    aiSummary:     overrides.aiSummary     ?? null,
    anomaly:       overrides.anomaly       ?? null,
    uploadedAt:    overrides.uploadedAt    ?? new Date().toISOString(),
    fileName:      overrides.fileName      ?? null,
  };
}

/** Maps raw API JSON (snake_case or camelCase) to InvoiceDTO. */
export function mapApiResponse(raw) {
  return createInvoiceDTO({
    id:            raw.id,
    vendor:        raw.vendor,
    amount:        raw.amount != null ? Number(raw.amount) : null,
    currency:      raw.currency      ?? "INR",
    invoiceDate:   raw.invoice_date  ?? raw.invoiceDate,
    dueDate:       raw.due_date      ?? raw.dueDate,
    category:      raw.category      ?? "OTHER",
    invoiceNumber: raw.invoice_number ?? raw.invoiceNumber,
    status:        raw.status        ?? "PENDING",
    rawOcrText:    raw.raw_ocr_text  ?? raw.rawOcrText,
    aiSummary:     raw.ai_summary    ?? raw.aiSummary,
    anomaly:       raw.anomaly,
    uploadedAt:    raw.uploaded_at   ?? raw.uploadedAt ?? new Date().toISOString(),
    fileName:      raw.file_name     ?? raw.fileName,
  });
}
