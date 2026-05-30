import { useState }           from "react";
import { InvoiceModal }       from "../components/modals/InvoiceModal";
import { StatusBadge }        from "../components/ui/StatusBadge";
import { CategoryBadge }      from "../components/ui/CategoryBadge";
import { useInvoiceFilter }   from "../hooks/useInvoiceFilter";
import { useInvoiceStore }    from "../store/invoiceStore";
import { getDaysOverdue }     from "../utils/invoiceHelpers";
import { formatCurrency, formatDate } from "../utils/formatters";
import { INVOICE_STATUSES, INVOICE_CATEGORIES } from "../constants";

export function InvoiceListPage() {
  const { state:{ invoices }, deleteInvoice, updateStatus } = useInvoiceStore();
  const [selected, setSelected] = useState(null);
  const { q,setQ, statusF,setStatusF, catF,setCatF, sortBy,sortDir,toggleSort, filtered } = useInvoiceFilter(invoices);

  const ColH = ({ col, label }) => (
    <th onClick={()=>toggleSort(col)} style={{ padding:"10px 14px", textAlign:"left", cursor:"pointer", fontSize:9.5, fontFamily:"var(--mono)", color:sortBy===col?"var(--ink)":"var(--ink3)", letterSpacing:1.5, fontWeight:600, whiteSpace:"nowrap", userSelect:"none" }}>
      {label} {sortBy===col?(sortDir==="asc"?"↑":"↓"):""}
    </th>
  );

  return (
    <div style={{ padding:"32px 36px", flex:1 }}>
      {selected && (
        <InvoiceModal invoice={selected} onClose={()=>setSelected(null)}
          onStatusChange={(id,status)=>{ updateStatus(id,status); setSelected(p=>p?{...p,status}:null); }}/>
      )}

      <div className="fu" style={{ marginBottom:22 }}>
        <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:2 }}>RECORDS</div>
        <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1.2, marginTop:3 }}>All Invoices</h1>
      </div>

      <div className="fu" style={{ display:"flex", gap:9, marginBottom:18, flexWrap:"wrap", animationDelay:"60ms" }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search vendor or invoice #…"
          style={{ flex:1, minWidth:200, padding:"9px 14px", border:"1px solid var(--border)", borderRadius:"var(--radius)", fontFamily:"var(--sans)", fontSize:13, background:"#fff", color:"var(--ink)", outline:"none" }}/>
        <Sel value={statusF} onChange={setStatusF} options={["ALL",...INVOICE_STATUSES]}/>
        <Sel value={catF}    onChange={setCatF}    options={["ALL",...INVOICE_CATEGORIES]}/>
      </div>

      <div className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", animationDelay:"120ms" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:860 }}>
            <thead>
              <tr style={{ background:"var(--paper)", borderBottom:"1px solid var(--border)" }}>
                <ColH col="vendor"        label="VENDOR"/>
                <ColH col="invoiceNumber" label="INV #"/>
                <ColH col="amount"        label="AMOUNT"/>
                <ColH col="dueDate"       label="DUE DATE"/>
                <th style={{ padding:"10px 14px", fontSize:9.5, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.5, textAlign:"left" }}>CATEGORY</th>
                <ColH col="status" label="STATUS"/>
                <th style={{ padding:"10px 14px", fontSize:9.5, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.5, textAlign:"left" }}>AI SUMMARY</th>
                <th style={{ width:60 }}/>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0
                ? <tr><td colSpan={8} style={{ padding:48, textAlign:"center", color:"var(--ink3)", fontSize:14 }}>No invoices match your filters.</td></tr>
                : filtered.map((inv,i)=>{
                    const days = getDaysOverdue(inv.dueDate);
                    return (
                      <tr key={inv.id} onClick={()=>setSelected(inv)} style={{ borderBottom:"1px solid var(--border)", cursor:"pointer", background:i%2===0?"#fff":"var(--paper)", transition:"background .1s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="var(--paper2)"}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"var(--paper)"}>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{inv.vendor??"—"}</div>
                          {inv.anomaly && <div style={{ fontSize:10, color:"var(--accent)", fontFamily:"var(--mono)" }}>⚠ anomaly</div>}
                        </td>
                        <td style={{ padding:"11px 14px", fontSize:11.5, fontFamily:"var(--mono)", color:"var(--ink2)" }}>{inv.invoiceNumber??"—"}</td>
                        <td style={{ padding:"11px 14px", fontFamily:"var(--mono)", fontSize:13, fontWeight:600 }}>{formatCurrency(inv.amount)}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ fontSize:12.5, color:days>0?"var(--accent)":"var(--ink2)" }}>{formatDate(inv.dueDate)}</div>
                          {days>0 && <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--accent)" }}>+{days}d overdue</div>}
                        </td>
                        <td style={{ padding:"11px 14px" }}><CategoryBadge category={inv.category}/></td>
                        <td style={{ padding:"11px 14px" }}><StatusBadge status={inv.status}/></td>
                        <td style={{ padding:"11px 14px", maxWidth:220 }}>
                          {inv.aiSummary
                            ? <span style={{ fontSize:11.5, color:"var(--ink2)", fontStyle:"italic", lineHeight:1.45, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inv.aiSummary}</span>
                            : <span style={{ color:"var(--ink3)", fontSize:11 }}>—</span>}
                        </td>
                        <td style={{ padding:"11px 14px" }} onClick={e=>e.stopPropagation()}>
                          <button onClick={()=>deleteInvoice(inv.id)} style={{ background:"none", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"4px 10px", cursor:"pointer", fontSize:11, color:"var(--ink3)" }}>✕</button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop:9, fontSize:11, fontFamily:"var(--mono)", color:"var(--ink3)" }}>
        {filtered.length} of {invoices.length} invoices · Click row to inspect
      </div>
    </div>
  );
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--radius)", fontFamily:"var(--sans)", fontSize:13, background:"#fff", color:"var(--ink)", cursor:"pointer" }}>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  );
}
