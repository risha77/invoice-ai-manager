import { useState }               from "react";
import { InvoiceProvider }        from "./store/invoiceStore";
import { Sidebar }                from "./components/layout/Sidebar";
import { AiChatPanel }            from "./components/modals/AiChatPanel";
import { NotificationPanel }      from "./components/modals/NotificationPanel";
import { DashboardPage }          from "./pages/DashboardPage";
import { InvoiceListPage }        from "./pages/InvoiceListPage";
import { UploadPage }             from "./pages/UploadPage";
import { PaymentTrackerPage }     from "./pages/PaymentTrackerPage";
import { RecurringPage }          from "./pages/RecurringPage";
import { AnalyticsPage }          from "./pages/AnalyticsPage";
import { ExportPage }             from "./pages/ExportPage";
import { SettingsPage }           from "./pages/SettingsPage";
import { useInvoiceStore }        from "./store/invoiceStore";

function Layout() {
  const { state:{ invoices } } = useInvoiceStore();
  const [view,      setView]      = useState("dashboard");
  const [showChat,  setShowChat]  = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const pages = {
    dashboard: <DashboardPage      setView={setView}/>,
    invoices:  <InvoiceListPage/>,
    upload:    <UploadPage/>,
    payments:  <PaymentTrackerPage/>,
    recurring: <RecurringPage/>,
    analytics: <AnalyticsPage/>,
    export:    <ExportPage/>,
    settings:  <SettingsPage/>,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--paper)", fontFamily:"var(--sans)" }}>
      <Sidebar
        view={view} setView={setView} invoices={invoices}
        onChatClick={()=>setShowChat(true)}
        onNotifClick={()=>setShowNotif(true)}
      />
      <main style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
        {pages[view]}
      </main>
      {showChat  && <AiChatPanel      invoices={invoices} onClose={()=>setShowChat(false)}/>}
      {showNotif && <NotificationPanel invoices={invoices} onClose={()=>setShowNotif(false)}/>}
    </div>
  );
}

export function App() {
  return (
    <InvoiceProvider>
      <Layout/>
    </InvoiceProvider>
  );
}
