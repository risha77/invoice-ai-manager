import { useInvoiceStore }        from "../store/invoiceStore";
import { detectRecurringPatterns, getCategoryIcon } from "../utils/invoiceHelpers";
import { formatCurrency, formatDate }               from "../utils/formatters";

export function RecurringPage() {
  const { state:{ invoices } } = useInvoiceStore();
  const patterns = detectRecurringPatterns(invoices);

  return (
    <div style={{ padding:"32px 36px", flex:1, maxWidth:860 }}>
      <div className="fu" style={{ marginBottom:22 }}>
        <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:2 }}>PATTERN DETECTION</div>
        <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1.2, marginTop:3 }}>Recurring Invoices</h1>
        <p style={{ fontSize:13, color:"var(--ink3)", marginTop:5 }}>Auto-detected vendors with repeat billing patterns.</p>
      </div>

      {patterns.length===0 ? (
        <div style={{ color:"var(--ink3)", fontSize:14 }}>No recurring patterns detected yet. Upload more invoices to build history.</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {patterns.map((r,i)=>(
            <div key={r.vendor} className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderTop:`3px solid ${r.isConsistent?"var(--success)":"var(--warn)"}`, borderRadius:10, padding:"20px 22px", animationDelay:`${i*50}ms` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.vendor}</div>
                  <div style={{ fontSize:11, color:"var(--ink3)", marginTop:3, fontFamily:"var(--mono)" }}>{getCategoryIcon(r.category)} {r.category}</div>
                </div>
                <span style={{ fontSize:10, fontFamily:"var(--mono)", fontWeight:700, padding:"3px 8px", background:r.isConsistent?"rgba(45,122,79,0.1)":"rgba(184,92,0,0.1)", color:r.isConsistent?"var(--success)":"var(--warn)", borderRadius:4 }}>
                  {r.isConsistent?"FIXED RATE":"VARIABLE"}
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                {[["Occurrences",r.count],["Avg Amount",formatCurrency(r.avgAmount)],["Total Spend",formatCurrency(r.totalSpend)],["Last Invoice",formatDate(r.lastDate)]].map(([l,v])=>(
                  <div key={l}>
                    <div style={{ fontSize:9.5, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.2 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize:13, fontWeight:700, marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>
              {r.isConsistent && (
                <div style={{ fontSize:11.5, color:"var(--success)", fontStyle:"italic", padding:"8px 10px", background:"rgba(45,122,79,0.05)", borderRadius:"var(--radius)", lineHeight:1.4 }}>
                  ✦ Consistent billing detected — consider setting up auto-payment.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
