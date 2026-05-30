import { buildNotifications } from "../../utils/invoiceHelpers";
const LC = { error:"var(--accent)", warn:"var(--warn)", info:"var(--info)" };
const LI = { error:"⚠", warn:"◎", info:"ℹ" };

export function NotificationPanel({ invoices, onClose }) {
  const notes = buildNotifications(invoices);
  return (
    <div className="fi" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1100, background:"rgba(14,14,14,0.5)", backdropFilter:"blur(3px)", display:"flex", alignItems:"flex-start", justifyContent:"flex-end", padding:"70px 20px 0" }}>
      <div className="fu" onClick={e=>e.stopPropagation()} style={{ width:360, maxHeight:520, background:"#fff", borderRadius:12, boxShadow:"var(--shadow-lg)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontWeight:700, fontSize:14 }}>Notifications {notes.length>0&&<span style={{ marginLeft:8, background:"var(--accent)", color:"#fff", borderRadius:10, fontSize:10, padding:"2px 7px", fontFamily:"var(--mono)" }}>{notes.length}</span>}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink3)", fontSize:16 }}>✕</button>
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {notes.length===0 ? <div style={{ padding:32, textAlign:"center", color:"var(--ink3)", fontSize:13 }}>All clear — no alerts right now.</div>
          : notes.map((n,i)=>(
            <div key={n.id} style={{ padding:"13px 18px", borderBottom:"1px solid var(--border)", display:"flex", gap:12, background:i%2===0?"#fff":"var(--paper)" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:LC[n.level]+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:LC[n.level], flexShrink:0 }}>{LI[n.level]}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{n.title}</div>
                <div style={{ fontSize:12, color:"var(--ink2)", lineHeight:1.4, marginTop:2 }}>{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
