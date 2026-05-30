export function Toggle({ value, onChange }) {
  return (
    <button onClick={()=>onChange(!value)} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", padding:0 }}>
      <div style={{ width:42, height:24, borderRadius:12, background:value?"#0e0e0e":"var(--paper3)", position:"relative", flexShrink:0, transition:"background .2s" }}>
        <div style={{ position:"absolute", top:3, left:value?21:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
      </div>
      <span style={{ fontSize:13, color:value?"var(--ink)":"var(--ink3)" }}>{value?"Enabled":"Disabled"}</span>
    </button>
  );
}
