import { useState, useMemo } from "react";
import { sortInvoices }      from "../utils/invoiceHelpers";

export function useInvoiceFilter(invoices) {
  const [q,       setQ]       = useState("");
  const [statusF, setStatusF] = useState("ALL");
  const [catF,    setCatF]    = useState("ALL");
  const [sortBy,  setSortBy]  = useState("uploadedAt");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    const base = invoices.filter(inv => {
      const mQ = !q||(inv.vendor??"").toLowerCase().includes(q.toLowerCase())
                   ||(inv.invoiceNumber??"").toLowerCase().includes(q.toLowerCase());
      return mQ && (statusF==="ALL"||inv.status===statusF) && (catF==="ALL"||inv.category===catF);
    });
    return sortInvoices(base, sortBy, sortDir);
  }, [invoices,q,statusF,catF,sortBy,sortDir]);

  const toggleSort = col => { if(sortBy===col) setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortBy(col);setSortDir("desc");} };
  return { q,setQ, statusF,setStatusF, catF,setCatF, sortBy,sortDir,toggleSort, filtered };
}
