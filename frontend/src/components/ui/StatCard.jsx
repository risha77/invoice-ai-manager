export function StatCard({ label, value, sub, topColor, delay=0 }) {
  return (
    <div className="fu" style={{ background:"#fff", border:"1px solid var(--border)", borderTop:`3px solid ${topColor}`, borderRadius:10, padding:"20px 22px", flex:"1 1 160px", animationDelay:`${delay}ms` }}>
      <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:1.5, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:"var(--ink)", margin:"6px 0 3px", letterSpacing:-0.8 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"var(--ink3)", fontFamily:"var(--mono)" }}>{sub}</div>}
    </div>
  );
}
