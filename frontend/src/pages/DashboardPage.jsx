import { StatCard }      from "../components/ui/StatCard";
import { StatusBadge }   from "../components/ui/StatusBadge";
import { CategoryBadge } from "../components/ui/CategoryBadge";
import { useInvoiceStore } from "../store/invoiceStore";
import { formatCurrency, formatDate } from "../utils/formatters";
import { sumAmounts, filterByStatus, groupByCategory } from "../utils/invoiceHelpers";

export function DashboardPage({ setView }) {
  const { state: { invoices } } = useInvoiceStore();

  const total      = sumAmounts(invoices);
  const paid       = sumAmounts(filterByStatus(invoices, "PAID"));
  const overdue    = filterByStatus(invoices, "OVERDUE");
  const pending    = filterByStatus(invoices, "PENDING");
  const byCategory = groupByCategory(invoices);
  const recent     = [...invoices].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt)).slice(0,6);

  return (
    <div style={{ padding:"32px 36px", flex:1, maxWidth:1100 }}>
      <Header label="OVERVIEW" title="Dashboard"
        sub={new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} />

      <div style={{ display:"flex", gap:14, marginBottom:26, flexWrap:"wrap" }}>
        <StatCard label="Total Invoices"  value={invoices.length}           sub="all time"                           topColor="var(--info)"    delay={0}  />
        <StatCard label="Total Value"     value={formatCurrency(total)}      sub="across all invoices"                topColor="var(--accent2)" delay={60} />
        <StatCard label="Collected"       value={formatCurrency(paid)}       sub={`${filterByStatus(invoices,"PAID").length} paid`} topColor="var(--success)" delay={120}/>
        <StatCard label="Overdue"         value={overdue.length}             sub={formatCurrency(sumAmounts(overdue))} topColor="var(--accent)"  delay={180}/>
        <StatCard label="Pending"         value={pending.length}             sub={formatCurrency(sumAmounts(pending))} topColor="var(--warn)"    delay={240}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:18 }}>
        <Card title="Spend by Category" delay={280}>
          {Object.keys(byCategory).length===0
            ? <Empty text="Upload invoices to see breakdown." />
            : Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>{
                const pct = total>0?(val/total*100):0;
                return (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <CategoryBadge category={cat}/>
                      <span style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--ink2)" }}>{formatCurrency(val)}</span>
                    </div>
                    <div style={{ position:"relative", height:5, background:"var(--paper2)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`, background:"var(--ink)", borderRadius:3, transition:"width .7s cubic-bezier(.4,0,.2,1)" }}/>
                    </div>
                    <div style={{ fontSize:10, color:"var(--ink3)", fontFamily:"var(--mono)", marginTop:2 }}>{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
        </Card>

        <Card title="Recent Activity" delay={340} action={{ label:"View all →", onClick:()=>setView("invoices") }}>
          {recent.length===0 ? <Empty text="No invoices yet." />
            : recent.map((inv,i)=>(
              <div key={inv.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:i<recent.length-1?"1px solid var(--border)":"none" }}>
                <div style={{ width:34, height:34, background:"var(--paper)", borderRadius:"var(--radius)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>
                  <CategoryBadge category={inv.category}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{inv.vendor||"Unknown"}</div>
                  <div style={{ fontSize:10, color:"var(--ink3)", fontFamily:"var(--mono)" }}>{formatDate(inv.invoiceDate)}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:12.5, fontWeight:600 }}>{formatCurrency(inv.amount)}</div>
                  <StatusBadge status={inv.status}/>
                </div>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}

function Header({ label, title, sub }) {
  return (
    <div className="fu" style={{ marginBottom:28 }}>
      <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:2 }}>{label}</div>
      <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1.2, marginTop:3 }}>{title}</h1>
      {sub && <p style={{ fontSize:13, color:"var(--ink3)", marginTop:4 }}>{sub}</p>}
    </div>
  );
}

function Card({ title, delay=0, children, action }) {
  return (
    <div className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:10, padding:"22px 24px", animationDelay:`${delay}ms` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.5, textTransform:"uppercase" }}>{title}</div>
        {action && <button onClick={action.onClick} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, fontFamily:"var(--mono)", color:"var(--info)" }}>{action.label}</button>}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ color:"var(--ink3)", fontSize:13 }}>{text}</div>;
}
