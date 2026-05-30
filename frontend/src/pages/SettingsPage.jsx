import { useState }         from "react";
import { Toggle }           from "../components/ui/Toggle";
import { useInvoiceStore }  from "../store/invoiceStore";

export function SettingsPage() {
  const { state:{ settings }, updateSettings } = useInvoiceStore();
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);
  const set = (k,v) => setLocal(p=>({...p,[k]:v}));

  function save() {
    updateSettings(local);
    localStorage.setItem("apiBaseUrl", local.apiBaseUrl??"");
    localStorage.setItem("apiToken",   local.apiToken??"");
    setSaved(true); setTimeout(()=>setSaved(false), 2200);
  }

  return (
    <div style={{ padding:"32px 36px", flex:1, maxWidth:680 }}>
      <div className="fu" style={{ marginBottom:28 }}>
        <div style={{ fontSize:10, fontFamily:"var(--mono)", color:"var(--ink3)", letterSpacing:2 }}>CONFIGURATION</div>
        <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:-1.2, marginTop:3 }}>Settings</h1>
      </div>

      <Section title="General" delay={0}>
        <Field label="Company Name" desc="Used in export headers."><TextIn value={local.companyName} onChange={v=>set("companyName",v)} placeholder="Your Company Pvt Ltd"/></Field>
        <Field label="Default Currency"><TextIn value={local.currency} onChange={v=>set("currency",v)} placeholder="INR"/></Field>
        <Field label="GST Number"><TextIn value={local.gstin} onChange={v=>set("gstin",v)} placeholder="29AABCZ1234F1Z5"/></Field>
      </Section>

      <Section title="AI & Automation" delay={60}>
        <Field label="Anomaly Detection" desc="Claude flags invoices with unusual amounts vs vendor history."><Toggle value={local.anomalyDetection} onChange={v=>set("anomalyDetection",v)}/></Field>
        <Field label="Auto-generate Summaries" desc="One-sentence AI summary for every upload."><Toggle value={local.autoSummary} onChange={v=>set("autoSummary",v)}/></Field>
        <Field label="Recurring Pattern Detection" desc="Identify vendors with regular billing patterns."><Toggle value={local.recurringDetection} onChange={v=>set("recurringDetection",v)}/></Field>
      </Section>

      <Section title="Notifications" delay={120}>
        <Field label="Overdue Alerts"><Toggle value={local.overdueAlerts} onChange={v=>set("overdueAlerts",v)}/></Field>
        <Field label="Due-soon Warning (days)" desc="Warn when invoice is due within this many days."><TextIn value={local.dueSoonDays} onChange={v=>set("dueSoonDays",v)} placeholder="7" type="number"/></Field>
        <Field label="Email Notifications" desc="Leave blank to disable."><TextIn value={local.notifyEmail} onChange={v=>set("notifyEmail",v)} placeholder="finance@company.com" type="email"/></Field>
      </Section>

      <Section title="Spring Boot Backend Connection" delay={180} dark>
        <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.5)", marginBottom:18, lineHeight:1.6 }}>
          Connect to your Spring Boot API for real Tesseract OCR, PostgreSQL persistence, and server-side PDF export. Leave blank to run in demo mode.
        </div>
        <Field label="API Base URL" dark><DarkIn value={local.apiBaseUrl} onChange={v=>set("apiBaseUrl",v)} placeholder="http://localhost:8080/api"/></Field>
        <Field label="Bearer Token" dark><DarkIn value={local.apiToken} onChange={v=>set("apiToken",v)} placeholder="sk-…" type="password"/></Field>
        <div style={{ marginTop:14, padding:"10px 12px", background:local.apiBaseUrl?"rgba(139,195,74,0.1)":"rgba(200,75,47,0.1)", border:`1px solid ${local.apiBaseUrl?"rgba(139,195,74,0.25)":"rgba(200,75,47,0.25)"}`, borderRadius:"var(--radius)", fontSize:11, fontFamily:"var(--mono)", color:local.apiBaseUrl?"#8bc34a":"#ff9080" }}>
          {local.apiBaseUrl?`✓ Will connect to: ${local.apiBaseUrl}`:"⚠ No API URL — running in demo mode"}
        </div>
      </Section>

      <button onClick={save} style={{ background:"#0e0e0e", color:"#fff", border:"none", borderRadius:"var(--radius)", padding:"12px 28px", cursor:"pointer", fontFamily:"var(--sans)", fontSize:14, fontWeight:700, letterSpacing:0.3, transition:"all .15s", marginTop:4 }}>
        {saved?"✓ Saved!":"Save Settings"}
      </button>
    </div>
  );
}

function Section({ title, delay=0, children, dark=false }) {
  return (
    <div className="fu" style={{ background:dark?"#0e0e0e":"#fff", border:"1px solid var(--border)", borderRadius:10, padding:"22px 24px", marginBottom:16, animationDelay:`${delay}ms` }}>
      <div style={{ fontSize:10, fontFamily:"var(--mono)", letterSpacing:1.5, marginBottom:18, textTransform:"uppercase", color:dark?"#e8a020":"var(--ink3)" }}>{title}</div>
      {children}
    </div>
  );
}
function Field({ label, desc, children, dark=false }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:700, marginBottom:4, color:dark?"rgba(255,255,255,0.6)":"var(--ink)" }}>{label}</div>
      {desc && <div style={{ fontSize:11.5, color:"var(--ink3)", marginBottom:7, lineHeight:1.4 }}>{desc}</div>}
      {children}
    </div>
  );
}
function TextIn({ value, onChange, placeholder, type="text" }) {
  return <input value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} style={{ width:"100%", padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--radius)", fontFamily:"var(--sans)", fontSize:13, outline:"none", background:"#fff", color:"var(--ink)" }}/>;
}
function DarkIn({ value, onChange, placeholder, type="text" }) {
  return <input value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} style={{ width:"100%", padding:"8px 12px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"var(--radius)", fontFamily:"var(--mono)", fontSize:12, color:"#fff", outline:"none" }}/>;
}
