import { createInvoiceDTO }            from "../dto/InvoiceDTO";
import { simulateOcrText }             from "../utils/ocrSimulator";
import { deriveStatus, isAmountAnomaly, sumAmounts } from "../utils/invoiceHelpers";
import { extractInvoiceFields, generateInvoiceSummary, describeAnomaly } from "./claudeService";
import { apiUploadInvoice }            from "./invoiceApiService";

const uid = () => Math.random().toString(36).slice(2,9).toUpperCase();
const delay = ms => new Promise(r=>setTimeout(r,ms));

export async function processInvoiceFile(file, existing=[], onLog=()=>{}) {
  const apiBase = localStorage.getItem("apiBaseUrl");

  if (apiBase) {
    onLog("Delegating to Spring Boot backend…");
    const dto = await apiUploadInvoice(file);
    onLog(`✓ Backend processed: ${dto.vendor} · ${dto.amount}`, "success");
    return dto;
  }

  onLog(`Processing "${file.name}"…`);
  onLog("  → Running OCR text extraction…");
  await delay(300);
  const ocrText = simulateOcrText(file);

  onLog("  → Sending to Claude AI for field extraction…");
  const fields = await extractInvoiceFields(ocrText);
  const status = deriveStatus(fields.dueDate);

  const inv = createInvoiceDTO({
    vendor:fields.vendor??file.name.replace(/\.[^.]+$/,""),
    amount:fields.amount??0, currency:fields.currency??"INR",
    invoiceDate:fields.invoiceDate??null, dueDate:fields.dueDate??null,
    category:fields.category??"OTHER", invoiceNumber:fields.invoiceNumber??`INV-${uid()}`,
    status, rawOcrText:ocrText, uploadedAt:new Date().toISOString(), fileName:file.name,
  });

  onLog("  → Generating AI status summary…");
  inv.aiSummary = await generateInvoiceSummary(inv);

  onLog("  → Checking for billing anomalies…");
  if (isAmountAnomaly(inv, existing)) {
    const peers = existing.filter(i=>i.vendor===inv.vendor);
    inv.anomaly = await describeAnomaly(inv, sumAmounts(peers)/peers.length);
  }

  onLog(`  ✓ Done — ${inv.vendor} · ${inv.currency} ${inv.amount} · ${inv.status}`, "success");
  return inv;
}
