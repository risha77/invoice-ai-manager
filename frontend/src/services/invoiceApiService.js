import { mapApiResponse } from "../dto/InvoiceDTO";

const base  = () => localStorage.getItem("apiBaseUrl")??"";
const token = () => localStorage.getItem("apiToken")??"";

async function apiFetch(path, opts={}) {
  const b = base();
  if (!b) throw new Error("NO_API_URL");
  const tk = token();
  const headers = { ...opts.headers, ...(tk?{Authorization:`Bearer ${tk}`}:{}) };
  const res = await fetch(`${b}${path}`, {...opts, headers});
  if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e?.message??`API ${res.status}`); }
  return res.json();
}

export async function apiUploadInvoice(file) {
  const form = new FormData(); form.append("file",file);
  return mapApiResponse(await apiFetch("/invoices",{method:"POST",body:form}));
}

export async function apiFetchInvoices(params={}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null&&v!=="")).toString();
  const raw = await apiFetch(`/invoices${qs?"?"+qs:""}`);
  return { content:(raw.content??raw).map(mapApiResponse), totalElements:raw.totalElements??raw.length };
}

export async function apiUpdateStatus(id, status) {
  return mapApiResponse(await apiFetch(`/invoices/${id}/status`,{method:"PATCH",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}));
}

export async function apiDeleteInvoice(id) { await apiFetch(`/invoices/${id}`,{method:"DELETE"}); }

export async function downloadServerPDF() {
  const res = await fetch(`${base()}/export/pdf`,{headers:token()?{Authorization:`Bearer ${token()}`}:{}});
  if (!res.ok) throw new Error(`PDF export failed: ${res.status}`);
  const url = URL.createObjectURL(await res.blob());
  Object.assign(document.createElement("a"),{href:url,download:"invoices.pdf"}).click();
  URL.revokeObjectURL(url);
}
