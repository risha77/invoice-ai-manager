import { useInvoiceStore }    from "../store/invoiceStore";
import { getDaysOverdue, sumAmounts } from "../utils/invoiceHelpers";
import { formatCurrency, formatDate } from "../utils/formatters";

export function PaymentTrackerPage() {
  const { state:{ invoices }, updateStatus } = useInvoiceStore();
  const actionable = [...invoices]
    .filter(i=>i.status!=="PAID")
    .sort((a,b)=>{ const o={OVERDUE:0,PENDING:1,PROCESSING:2}; return (o[a.status]??3)-(o[b.status]??3)||new Date(a.dueDate)-new Date(b.dueDate); });
  const totalDue = sumAmounts(actionable);

  return (
    <div style={{ padding:"32px 36px", flex:1, maxWidth:900 }}>
      <div className="fu" style={{ marginBottom:22 }}>
        <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:2 }}>PAYMENT QUEUE</div>
        <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1.2, marginTop:3 }}>Payment Tracker</h1>
        <p style={{ fontSize:13, color:"var(--ink3)", marginTop:5 }}>
          {actionable.length} unpaid invoice{actionable.length!==1?"s":""} · Total due: <strong>{formatCurrency(totalDue)}</strong>
        </p>
      </div>

      {actionable.length===0 ? (
        <div className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:10, padding:48, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>✓</div>
          <div style={{ fontSize:16, fontWeight:700 }}>All caught up!</div>
          <div style={{ fontSize:13, color:"var(--ink3)", marginTop:6 }}>No outstanding payments.</div>
        </div>
      ) : actionable.map((inv,i)=>{
          const days    = getDaysOverdue(inv.dueDate);
          const urgency = inv.status==="OVERDUE"?"var(--accent)":days>-4?"var(--warn)":"var(--info)";
          return (
            <div key={inv.id} className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderLeft:`4px solid ${urgency}`, borderRadius:10, padding:"18px 20px", marginBottom:12, display:"flex", gap:16, alignItems:"center", animationDelay:`${i*40}ms` }}>
              <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:urgency+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:urgency, fontFamily:"var(--mono)" }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>{inv.vendor}</span>
                  <span style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)" }}>{inv.invoiceNumber}</span>
                  <span style={{ fontSize:10, fontFamily:"var(--mono)", fontWeight:700, padding:"2px 7px", background:urgency+"18", color:urgency, borderRadius:4 }}>{inv.status}</span>
                </div>
                <div style={{ fontSize:12, color:"var(--ink3)", marginTop:4, lineHeight:1.5 }}>{inv.aiSummary??`Due ${formatDate(inv.dueDate)}`}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:"var(--mono)", letterSpacing:-0.5 }}>{formatCurrency(inv.amount)}</div>
                <div style={{ fontSize:11, color:days>0?"var(--accent)":"var(--ink3)", fontFamily:"var(--mono)", marginTop:2 }}>
                  {days>0?`+${days}d overdue`:days<0?`${Math.abs(days)}d left`:"Due today"}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                <button onClick={()=>updateStatus(inv.id,"PAID")} style={{ background:"#0e0e0e", color:"#fff", border:"none", borderRadius:"var(--radius)", padding:"7px 14px", cursor:"pointer", fontFamily:"var(--sans)", fontSize:12, fontWeight:700 }}>Mark Paid ✓</button>
                <button onClick={()=>updateStatus(inv.id,"PROCESSING")} style={{ background:"none", color:"var(--ink2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"6px 14px", cursor:"pointer", fontFamily:"var(--sans)", fontSize:12 }}>Processing…</button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
