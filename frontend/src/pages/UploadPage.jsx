import { useRef }            from "react";
import { useInvoiceUpload }  from "../hooks/useInvoiceUpload";
import { StatusBadge }       from "../components/ui/StatusBadge";
import { Spinner }           from "../components/ui/Spinner";
import { formatCurrency, formatDate, formatFileSize } from "../utils/formatters";

export function UploadPage() {
  const { queue, busy, logs, results, enqueue, dequeue, processAll } = useInvoiceUpload();
  const inputRef = useRef();
  const logColor = { success:"#8bc34a", error:"#ff6b6b", info:"rgba(255,255,255,0.65)" };

  return (
    <div style={{ padding:"32px 36px", flex:1, maxWidth:780 }}>
      <div className="fu" style={{ marginBottom:28 }}>
        <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:2 }}>OCR + AI EXTRACTION</div>
        <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1.2, marginTop:3 }}>Upload Invoices</h1>
        <p style={{ fontSize:13, color:"var(--ink3)", marginTop:5, lineHeight:1.5 }}>
          Drop PDF or image invoices. Claude AI extracts vendor, amount, due date and generates a status summary automatically.
        </p>
      </div>

      <DropZone busy={busy} onFiles={enqueue} inputRef={inputRef}/>

      {queue.length>0 && (
        <div className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:10, padding:"14px 18px", marginBottom:14 }}>
          <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.5, marginBottom:10 }}>QUEUED — {queue.length} FILE{queue.length>1?"S":""}</div>
          {queue.map((f,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<queue.length-1?"1px solid var(--border)":"none" }}>
              <span style={{ fontSize:18 }}>📄</span>
              <span style={{ flex:1, fontSize:13 }}>{f.name}</span>
              <span style={{ fontSize:11, color:"var(--ink3)", fontFamily:"var(--mono)" }}>{formatFileSize(f.size)}</span>
              <button onClick={()=>dequeue(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink3)", fontSize:14 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <button onClick={processAll} disabled={!queue.length||busy} style={{
        padding:"13px 30px",
        background:queue.length&&!busy?"#0e0e0e":"var(--paper3)",
        color:queue.length&&!busy?"#fff":"var(--ink3)",
        border:"none", borderRadius:"var(--radius)",
        cursor:queue.length&&!busy?"pointer":"not-allowed",
        fontFamily:"var(--sans)", fontSize:14, fontWeight:700, letterSpacing:0.4,
        display:"inline-flex", alignItems:"center", gap:10, transition:"all .15s", marginBottom:18,
      }}>
        {busy&&<Spinner size={15} color="#fff"/>}
        {busy?"Processing with Claude AI…":`Process ${queue.length||""} Invoice${queue.length!==1?"s":""}`}
      </button>

      {(busy||logs.length>0) && (
        <div className="fu" style={{ background:"#0e0e0e", borderRadius:10, padding:"16px 18px", fontFamily:"var(--mono)", fontSize:12, marginBottom:18, maxHeight:240, overflowY:"auto" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:2, marginBottom:10 }}>PIPELINE LOG</div>
          {logs.map((l,i)=>(
            <div key={i} className="fi" style={{ marginBottom:3, color:logColor[l.level]??logColor.info, animationDelay:`${i*20}ms` }}>{l.msg}</div>
          ))}
          {busy && <div style={{ color:"var(--accent2)", animation:"blink 1s infinite" }}>█</div>}
        </div>
      )}

      {results.length>0 && (
        <div className="fu">
          <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.5, marginBottom:10 }}>
            RESULTS — {results.filter(r=>r.ok).length}/{results.length} processed
          </div>
          {results.map((r,i)=>(
            <div key={i} style={{ background:r.ok?"rgba(45,122,79,0.05)":"rgba(200,75,47,0.05)", border:`1px solid ${r.ok?"rgba(45,122,79,0.18)":"rgba(200,75,47,0.18)"}`, borderRadius:9, padding:"14px 16px", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:r.ok?8:0 }}>
                <span style={{ fontSize:16, color:r.ok?"var(--success)":"var(--accent)" }}>{r.ok?"✓":"✕"}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>{r.file}</span>
                {r.ok && <span style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontSize:10, color:"var(--success)", letterSpacing:1 }}>SAVED</span>}
              </div>
              {r.ok&&r.invoice && (
                <div>
                  <div style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.8 }}>
                    <strong>{r.invoice.vendor}</strong> · {formatCurrency(r.invoice.amount)} · Due {formatDate(r.invoice.dueDate)} · <StatusBadge status={r.invoice.status}/>
                  </div>
                  {r.invoice.aiSummary && <div style={{ fontSize:12.5, color:"var(--info)", fontStyle:"italic", marginTop:4 }}>✦ {r.invoice.aiSummary}</div>}
                  {r.invoice.anomaly   && <div style={{ fontSize:12, color:"var(--accent)", marginTop:4 }}>⚠ {r.invoice.anomaly}</div>}
                </div>
              )}
              {!r.ok && <div style={{ fontSize:12, color:"var(--accent)" }}>{r.error}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DropZone({ busy, onFiles, inputRef }) {
  const { useState } = require("react");
  const [drag, setDrag] = useState(false);
  return (
    <div className="fu"
      onDragOver={e=>{e.preventDefault();setDrag(true);}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);onFiles(e.dataTransfer.files);}}
      onClick={()=>!busy&&inputRef.current.click()}
      style={{ border:`2px dashed ${drag?"var(--accent)":"var(--border)"}`, borderRadius:14, padding:"52px 40px", textAlign:"center", cursor:busy?"not-allowed":"pointer", background:drag?"rgba(200,75,47,0.04)":"#fff", transition:"all .2s", marginBottom:18, animationDelay:"60ms" }}>
      <input ref={inputRef} type="file" multiple accept=".pdf,image/*" style={{ display:"none" }} onChange={e=>onFiles(e.target.files)}/>
      <div style={{ fontSize:40, marginBottom:10, opacity:.7 }}>↑</div>
      <div style={{ fontSize:15, fontWeight:700, marginBottom:5 }}>Drop PDF or image files here</div>
      <div style={{ fontSize:12.5, color:"var(--ink3)" }}>or click to browse · PDF, PNG, JPG · max 20 MB each</div>
    </div>
  );
}
