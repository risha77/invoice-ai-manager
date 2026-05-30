import { useState }          from "react";
import { StatusBadge }       from "../ui/StatusBadge";
import { CategoryBadge }     from "../ui/CategoryBadge";
import { getDaysOverdue, getStatusColor } from "../../utils/invoiceHelpers";
import { formatDate, formatCurrency }     from "../../utils/formatters";
import { INVOICE_STATUSES }               from "../../constants";

export function InvoiceModal({ invoice, onClose, onStatusChange }) {
  if (!invoice) return null;
  const days = getDaysOverdue(invoice.dueDate);
  return (
    <div className="fi" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(14,14,14,0.55)", backdropFilter:"blur(3px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div className="fu" onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:14, width:"100%", maxWidth:560, boxShadow:"var(--shadow-lg)", overflow:"hidden" }}>
        <div style={{ background:"#0e0e0e", padding:"22px 26px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"#e8a020", letterSpacing:2 }}>{invoice.invoiceNumber}</div>
            <div style={{ fontFamily:"var(--serif)", fontSize:24, color:"#fff", fontStyle:"italic", marginTop:4 }}>{invoice.vendor}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:14 }}>✕</button>
        </div>
        <div style={{ padding:"22px 26px", overflowY:"auto", maxHeight:"70vh" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ fontSize:32, fontWeight:800, letterSpacing:-1.5 }}>{formatCurrency(invoice.amount)}</div>
            <select value={invoice.status} onChange={e=>onStatusChange(invoice.id,e.target.value)} style={{ padding:"5px 10px", fontFamily:"var(--mono)", fontSize:11, border:`2px solid ${getStatusColor(invoice.status)}`, borderRadius:"var(--radius)", fontWeight:700, color:getStatusColor(invoice.status), background:"#fff", cursor:"pointer" }}>
              {INVOICE_STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 20px", marginBottom:20 }}>
            {[["Invoice Date",formatDate(invoice.invoiceDate)],["Due Date",formatDate(invoice.dueDate)],
              ["Category",<CategoryBadge key="c" category={invoice.category}/>],["File",invoice.fileName??"—"],
              ["Days Overdue",days>0?`+${days} days`:days<0?`${Math.abs(days)} days left`:"Due today"],
              ["Uploaded",formatDate(invoice.uploadedAt)]].map(([k,v])=>(
              <div key={k}>
                <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.2, marginBottom:3 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize:13, fontWeight:600, color:k==="Days Overdue"&&days>0?"var(--accent)":"var(--ink)" }}>{v}</div>
              </div>
            ))}
          </div>
          {invoice.aiSummary && <InfoBlock color="var(--info)" label="✦ AI SUMMARY">{invoice.aiSummary}</InfoBlock>}
          {invoice.anomaly   && <InfoBlock color="var(--accent)" label="⚠ ANOMALY" mt={10}>{invoice.anomaly}</InfoBlock>}
          {invoice.rawOcrText && <OcrToggle text={invoice.rawOcrText}/>}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ color, label, children, mt=0 }) {
  return (
    <div style={{ background:"var(--paper)", borderLeft:`3px solid ${color}`, borderRadius:"0 var(--radius) var(--radius) 0", padding:"12px 14px", marginTop:mt }}>
      <div style={{ fontSize:9, fontFamily:"var(--mono)", color, letterSpacing:1.5, marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:13, color:"var(--ink2)", fontStyle:"italic", lineHeight:1.5 }}>{children}</div>
    </div>
  );
}

function OcrToggle({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop:14 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ background:"none", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"6px 12px", cursor:"pointer", fontFamily:"var(--mono)", fontSize:11, color:"var(--ink3)" }}>
        {open?"▲ Hide OCR text":"▼ Show raw OCR text"}
      </button>
      {open && <pre style={{ marginTop:8, padding:"12px 14px", background:"#0e0e0e", color:"#8bc34a", borderRadius:"var(--radius)", fontSize:11, fontFamily:"var(--mono)", whiteSpace:"pre-wrap", lineHeight:1.6, maxHeight:200, overflowY:"auto" }}>{text}</pre>}
    </div>
  );
}
