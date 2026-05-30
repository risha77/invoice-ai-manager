import { useState, useCallback }       from "react";
import { processInvoiceFile }          from "../services/invoiceProcessingService";
import { useInvoiceStore }             from "../store/invoiceStore";

export function useInvoiceUpload() {
  const { state, addInvoice } = useInvoiceStore();
  const [queue,   setQueue]   = useState([]);
  const [busy,    setBusy]    = useState(false);
  const [logs,    setLogs]    = useState([]);
  const [results, setResults] = useState([]);

  const addLog = (msg, level="info") => setLogs(p=>[...p,{msg,level}]);
  const enqueue  = useCallback(fl => setQueue(p=>[...p,...Array.from(fl).filter(f=>f.type==="application/pdf"||f.type.startsWith("image/"))]), []);
  const dequeue  = useCallback(i  => setQueue(p=>p.filter((_,j)=>j!==i)), []);
  const clearAll = useCallback(()  => setQueue([]), []);

  const processAll = useCallback(async () => {
    if (!queue.length||busy) return;
    setBusy(true); setResults([]); setLogs([]);
    const done=[];
    for (const file of queue) {
      try {
        const inv = await processInvoiceFile(file, [...state.invoices,...done.filter(d=>d.ok).map(d=>d.invoice)], addLog);
        addInvoice(inv);
        done.push({file:file.name,invoice:inv,ok:true});
      } catch(err) {
        addLog(`  ✕ Error: ${err.message}`,"error");
        done.push({file:file.name,error:err.message,ok:false});
      }
    }
    setResults(done); setQueue([]); setBusy(false);
  }, [queue,busy,state.invoices,addInvoice]);

  return { queue, busy, logs, results, enqueue, dequeue, clearAll, processAll };
}
