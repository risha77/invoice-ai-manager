import { useEffect, useRef } from "react";
import { useAiChat }         from "../../hooks/useAiChat";
import { Spinner }           from "../ui/Spinner";

const SUGGESTIONS = ["Which invoices are overdue?","What's the total pending amount?","Which vendor do I spend the most on?","Any anomalies I should review?"];

export function AiChatPanel({ invoices, onClose }) {
  const { messages, input, setInput, busy, sendMessage } = useAiChat(invoices);
  const bottomRef = useRef();
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  return (
    <div className="fi" onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1100, background:"rgba(14,14,14,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:24 }}>
      <div className="fu" onClick={e=>e.stopPropagation()} style={{ width:420, height:580, background:"#fff", borderRadius:14, boxShadow:"var(--shadow-lg)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"#0e0e0e", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:17, color:"#fff", fontStyle:"italic" }}>AI Assistant</div>
            <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"#e8a020", letterSpacing:1.5, marginTop:1 }}>POWERED BY CLAUDE</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontSize:13 }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
          {messages.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"82%", padding:"10px 13px", borderRadius:10, fontSize:13, lineHeight:1.55, background:m.role==="user"?"#0e0e0e":"var(--paper)", color:m.role==="user"?"#fff":"var(--ink)", borderBottomRightRadius:m.role==="user"?3:10, borderBottomLeftRadius:m.role==="assistant"?3:10 }}>{m.text}</div>
            </div>
          ))}
          {busy && <div style={{ display:"flex", gap:5, padding:"10px 13px", background:"var(--paper)", borderRadius:10, width:"fit-content" }}>{[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--ink3)", animation:`pulse 1.2s ease ${i*.2}s infinite` }}/>)}</div>}
          <div ref={bottomRef}/>
        </div>
        {messages.length===1 && (
          <div style={{ padding:"0 18px 10px", display:"flex", flexWrap:"wrap", gap:6 }}>
            {SUGGESTIONS.map(s=><button key={s} onClick={()=>setInput(s)} style={{ background:"var(--paper)", border:"1px solid var(--border)", borderRadius:20, padding:"5px 11px", fontSize:11, cursor:"pointer", color:"var(--ink2)", fontFamily:"var(--sans)" }}>{s}</button>)}
          </div>
        )}
        <div style={{ padding:"10px 14px", borderTop:"1px solid var(--border)", display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Ask about your invoices…" style={{ flex:1, padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--radius)", fontFamily:"var(--sans)", fontSize:13, outline:"none", background:"var(--paper)" }}/>
          <button onClick={sendMessage} disabled={!input.trim()||busy} style={{ background:input.trim()&&!busy?"#0e0e0e":"var(--paper3)", color:input.trim()&&!busy?"#fff":"var(--ink3)", border:"none", borderRadius:"var(--radius)", padding:"9px 14px", cursor:input.trim()&&!busy?"pointer":"not-allowed", fontSize:14, fontWeight:700, display:"flex", alignItems:"center" }}>
            {busy?<Spinner size={14} color="#888"/>:"→"}
          </button>
        </div>
      </div>
    </div>
  );
}
