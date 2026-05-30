import { formatCurrency, formatDate } from "./formatters";

const trigger = (content, mime, name) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  Object.assign(document.createElement("a"), { href:url, download:name }).click();
  URL.revokeObjectURL(url);
};

export const exportCSV = (invoices) => {
  const H = ["ID","Vendor","Invoice #","Amount","Currency","Invoice Date","Due Date","Category","Status","AI Summary","Anomaly"];
  const esc = v => `"${String(v??"").replace(/"/g,'""')}"`;
  const rows = invoices.map(i=>[i.id,i.vendor,i.invoiceNumber,i.amount,i.currency,
    i.invoiceDate,i.dueDate,i.category,i.status,i.aiSummary,i.anomaly].map(esc).join(","));
  trigger([H.map(esc).join(","),...rows].join("\n"), "text/csv",
    `invoices_${new Date().toISOString().slice(0,10)}.csv`);
};

export const exportJSON = (invoices) =>
  trigger(JSON.stringify(invoices,null,2), "application/json",
    `invoices_${new Date().toISOString().slice(0,10)}.json`);

export const exportMarkdown = (invoices) => {
  const lines = ["# Invoice Report",
    `**Generated:** ${new Date().toLocaleString("en-IN")}  `,
    `**Total:** ${formatCurrency(invoices.reduce((s,i)=>s+(i.amount||0),0))}`,
    "","| Vendor | Invoice # | Amount | Due Date | Status | AI Summary |",
    "|--------|-----------|--------|----------|--------|------------|",
    ...invoices.map(i=>`| ${i.vendor??""} | ${i.invoiceNumber??""} | ${formatCurrency(i.amount)} | ${formatDate(i.dueDate)} | **${i.status}** | ${i.aiSummary??""} |`)];
  trigger(lines.join("\n"), "text/markdown",
    `invoices_${new Date().toISOString().slice(0,10)}.md`);
};
