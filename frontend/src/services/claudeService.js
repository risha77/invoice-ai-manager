import { AI_MODEL } from "../constants";
import { getDaysOverdue } from "../utils/invoiceHelpers";

async function callClaude(system, user, maxTokens=800) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:AI_MODEL, max_tokens:maxTokens, system, messages:[{role:"user",content:user}] }),
  });
  if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.error?.message??`API ${res.status}`); }
  const d = await res.json();
  return d.content?.map(b=>b.text??"").join("")??"";
}

const EXTRACT_SYS = `You are a precise invoice parser. Return ONLY valid JSON, no markdown.
Schema (null for missing): {"vendor":"string|null","amount":"number|null","currency":"INR",
"invoiceDate":"YYYY-MM-DD|null","dueDate":"YYYY-MM-DD|null",
"category":"SAAS|UTILITIES|SERVICES|RENT|TRAVEL|OTHER","invoiceNumber":"string|null"}`;

export async function extractInvoiceFields(ocrText) {
  const raw = await callClaude(EXTRACT_SYS, `Parse this invoice OCR text:\n\n${ocrText}`, 400);
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); }
  catch { return { currency:"INR", category:"OTHER" }; }
}

export async function generateInvoiceSummary(invoice) {
  const days = getDaysOverdue(invoice.dueDate);
  return callClaude(
    "You are a finance dashboard assistant. Write exactly ONE sentence (max 18 words) summarising invoice status. Direct, no emojis.",
    `Vendor:${invoice.vendor}|Amount:${invoice.currency} ${invoice.amount}|Due:${invoice.dueDate}|Status:${invoice.status}|DaysOverdue:${Math.max(0,days)}`,
    80
  );
}

export async function describeAnomaly(invoice, avgAmount) {
  const pct = (((invoice.amount/avgAmount)-1)*100).toFixed(0);
  return callClaude(
    "You are a financial anomaly detector. Write ONE short alert sentence (max 15 words). No emojis.",
    `Invoice ${invoice.amount} INR is ${pct}% above average ${avgAmount.toFixed(0)} INR for vendor ${invoice.vendor}.`,
    60
  );
}

export async function askInvoiceAssistant(question, invoices) {
  const ctx = invoices.map(i=>({vendor:i.vendor,amount:i.amount,currency:i.currency,
    dueDate:i.dueDate,status:i.status,category:i.category,invoiceNumber:i.invoiceNumber,anomaly:i.anomaly}));
  return callClaude(
    `You are an AI assistant for an invoice management system.\nInvoice data:\n${JSON.stringify(ctx,null,2)}\nAnswer concisely. Use INR. Today: ${new Date().toISOString().slice(0,10)}.`,
    question, 400
  );
}
