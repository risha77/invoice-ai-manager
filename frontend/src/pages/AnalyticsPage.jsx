import { StatCard }      from "../components/ui/StatCard";
import { useInvoiceStore } from "../store/invoiceStore";
import { sumAmounts, filterByStatus, groupByMonth, topVendorsBySpend } from "../utils/invoiceHelpers";
import { formatCurrency } from "../utils/formatters";

export function AnalyticsPage() {
  const { state:{ invoices } } = useInvoiceStore();
  const total      = sumAmounts(invoices);
  const avgAmount  = invoices.length>0?total/invoices.length:0;
  const overdueAmt = sumAmounts(filterByStatus(invoices,"OVERDUE"));
  const paidAmt    = sumAmounts(filterByStatus(invoices,"PAID"));
  const collRate   = total>0?(paidAmt/total*100).toFixed(1):"0.0";
  const anomalies  = invoices.filter(i=>i.anomaly);
  const monthly    = Object.entries(groupByMonth(invoices)).sort();
  const maxMo      = Math.max(...monthly.map(([,v])=>v),1);
  const topVendors = topVendorsBySpend(invoices);

  return (
    <div style={{ padding:"32px 36px", flex:1, maxWidth:1000 }}>
      <div className="fu" style={{ marginBottom:28 }}>
        <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:2 }}>INSIGHTS</div>
        <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1.2, marginTop:3 }}>Analytics</h1>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard label="Avg Invoice Value"  value={formatCurrency(avgAmount)}  sub="per invoice"  topColor="var(--info)"    delay={0}  />
        <StatCard label="Collection Rate"    value={`${collRate}%`}              sub="paid vs total" topColor="var(--success)" delay={60} />
        <StatCard label="Overdue Exposure"   value={formatCurrency(overdueAmt)} sub="at risk"       topColor="var(--accent)"  delay={120}/>
        <StatCard label="Anomalies Detected" value={anomalies.length}            sub="need review"   topColor="var(--warn)"    delay={180}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:18 }}>
        <Card label="Monthly Invoice Volume">
          {monthly.length===0 ? <Empty/> : (
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:120 }}>
              {monthly.map(([month,val])=>{
                const pct=val/maxMo*100;
                return (
                  <div key={month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{ fontSize:9, fontFamily:"var(--mono)", color:"var(--ink3)", textAlign:"center" }}>{formatCurrency(val).replace("₹","₹")}</div>
                    <div style={{ width:"100%", background:"var(--ink)", borderRadius:"3px 3px 0 0", height:`${pct}%`, minHeight:4, transition:"height .5s ease" }}/>
                    <div style={{ fontSize:9, fontFamily:"var(--mono)", color:"var(--ink3)" }}>{month.slice(5)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card label="Top Vendors by Spend">
          {topVendors.length===0 ? <Empty/> : topVendors.map(({vendor,total:vt},i)=>{
            const pct=total>0?vt/total*100:0;
            return (
              <div key={vendor} style={{ marginBottom:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12.5, fontWeight:600 }}><span style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--ink3)", marginRight:6 }}>{i+1}.</span>{vendor}</span>
                  <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--ink2)" }}>{formatCurrency(vt)}</span>
                </div>
                <div style={{ height:4, background:"var(--paper2)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:"var(--ink)", borderRadius:2, transition:"width .6s ease" }}/>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {anomalies.length>0 && (
        <div className="fu" style={{ marginTop:18, background:"#fff", border:"1px solid var(--border)", borderTop:"3px solid var(--accent)", borderRadius:10, padding:"20px 24px", animationDelay:"340ms" }}>
          <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--accent)", letterSpacing:1.5, marginBottom:14 }}>⚠ ANOMALIES REQUIRING REVIEW</div>
          {anomalies.map(inv=>(
            <div key={inv.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{inv.vendor} <span style={{ fontFamily:"var(--mono)", color:"var(--ink3)", fontWeight:400, fontSize:11 }}>{inv.invoiceNumber}</span></div>
                <div style={{ fontSize:12, color:"var(--ink2)", fontStyle:"italic", marginTop:2 }}>{inv.anomaly}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:700 }}>{formatCurrency(inv.amount)}</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--ink3)" }}>{inv.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Card({ label, children }) {
  return (
    <div className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:10, padding:"22px 24px" }}>
      <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.5, marginBottom:16, textTransform:"uppercase" }}>{label}</div>
      {children}
    </div>
  );
}
function Empty() { return <div style={{ color:"var(--ink3)", fontSize:13 }}>No data yet.</div>; }
