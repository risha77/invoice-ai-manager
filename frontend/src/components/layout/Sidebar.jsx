import { NAV_ITEMS }           from "../../constants";
import { buildNotifications }   from "../../utils/invoiceHelpers";

export function Sidebar({ view, setView, invoices, onChatClick, onNotifClick }) {
  const overdue    = invoices.filter(i=>i.status==="OVERDUE").length;
  const notifCount = buildNotifications(invoices).length;
  const unpaid     = invoices.filter(i=>i.status!=="PAID").length;

  return (
    <aside style={{ width:224, minHeight:"100vh", background:"#0e0e0e", display:"flex", flexDirection:"column", position:"sticky", top:0, flexShrink:0 }}>
      <div style={{ padding:"26px 22px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontFamily:"var(--serif)", fontSize:21, color:"#fff", fontStyle:"italic", letterSpacing:-0.5 }}>Invoice</div>
        <div style={{ fontFamily:"var(--mono)", fontSize:9, color:"#e8a020", letterSpacing:3, marginTop:1 }}>AI MANAGER</div>
      </div>

      <div style={{ padding:"10px 10px 0", display:"flex", gap:6 }}>
        <QuickBtn onClick={onNotifClick} badge={notifCount} label="◎ Alerts" accent={notifCount>0?"#c84b2f":null}/>
        <QuickBtn onClick={onChatClick}  label="✦ AI Chat" accent="#e8a020"/>
      </div>

      <nav style={{ flex:1, padding:"10px", overflowY:"auto" }}>
        {NAV_ITEMS.map(item => {
          const active = view===item.id;
          const badge  = item.id==="invoices"?invoices.length:item.id==="payments"?unpaid:0;
          return (
            <button key={item.id} onClick={()=>setView(item.id)} style={{
              display:"flex", alignItems:"center", gap:9, width:"100%",
              padding:"9px 11px", marginBottom:2,
              background:active?"rgba(200,75,47,0.18)":"transparent",
              border:active?"1px solid rgba(200,75,47,0.35)":"1px solid transparent",
              borderRadius:"var(--radius)", cursor:"pointer",
              color:active?"#fff":"rgba(255,255,255,0.45)",
              fontFamily:"var(--sans)", fontSize:12.5, fontWeight:600, letterSpacing:0.3,
              transition:"all .12s", textAlign:"left",
            }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.color="rgba(255,255,255,0.75)";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.color="rgba(255,255,255,0.45)";e.currentTarget.style.background="transparent";}}}
            >
              <span style={{ fontSize:15, opacity:.85, minWidth:16 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {badge>0 && <span style={{ background:item.id==="payments"?"rgba(200,75,47,0.4)":"rgba(255,255,255,0.09)", color:item.id==="payments"?"#ff9080":"rgba(255,255,255,0.5)", borderRadius:10, fontSize:10, padding:"1px 7px", fontFamily:"var(--mono)" }}>{badge}</span>}
            </button>
          );
        })}
      </nav>

      {overdue>0 && (
        <div style={{ margin:"0 10px 10px", padding:"10px 12px", background:"rgba(200,75,47,0.14)", border:"1px solid rgba(200,75,47,0.28)", borderRadius:"var(--radius)", animation:"pulse 2.5s ease infinite" }}>
          <div style={{ color:"#ff9080", fontSize:10, fontFamily:"var(--mono)", letterSpacing:1.5 }}>⚠ OVERDUE</div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800, letterSpacing:-0.5 }}>{overdue}</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>invoice{overdue>1?"s":""} need attention</div>
        </div>
      )}
      <div style={{ padding:"8px 14px 16px", fontSize:10, fontFamily:"var(--mono)", color:"rgba(255,255,255,0.18)", lineHeight:1.6 }}>
        Claude AI · Tesseract OCR<br/>Spring Boot Ready
      </div>
    </aside>
  );
}

function QuickBtn({ onClick, badge, label, accent }) {
  return (
    <button onClick={onClick} style={{ flex:1, padding:"7px 0", background:accent?`${accent}18`:"rgba(255,255,255,0.05)", border:`1px solid ${accent?accent+"30":"rgba(255,255,255,0.08)"}`, borderRadius:"var(--radius)", cursor:"pointer", color:accent??"rgba(255,255,255,0.5)", fontFamily:"var(--mono)", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", gap:5, transition:"all .12s" }}>
      {label}
      {badge>0 && <span style={{ background:"#c84b2f", color:"#fff", borderRadius:8, padding:"0 5px", fontSize:9 }}>{badge}</span>}
    </button>
  );
}
