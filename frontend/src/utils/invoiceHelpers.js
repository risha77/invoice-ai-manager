import { STATUS_COLORS, CATEGORY_ICONS, DUE_SOON_DAYS, ANOMALY_THRESHOLD,
         RECURRING_MIN_COUNT, RECURRING_VARIANCE } from "../constants";

export const getDaysOverdue = (d) => d
  ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;

export const deriveStatus = (dueDate) =>
  getDaysOverdue(dueDate) > 0 ? "OVERDUE" : "PENDING";

export const getStatusColor  = (s) => STATUS_COLORS[s]  ?? "#7a7a7a";
export const getCategoryIcon = (c) => CATEGORY_ICONS[c] ?? "◉";

export const sumAmounts       = (list) => list.reduce((s,i) => s+(i.amount||0), 0);
export const filterByStatus   = (list, s) => list.filter(i => i.status === s);

export const groupByCategory  = (list) => list.reduce((acc,i) => {
  acc[i.category] = (acc[i.category]||0) + (i.amount||0); return acc; }, {});

export const groupByMonth     = (list) => list.reduce((acc,i) => {
  if (!i.invoiceDate) return acc;
  const k = i.invoiceDate.slice(0,7);
  acc[k] = (acc[k]||0) + (i.amount||0); return acc; }, {});

export const topVendorsBySpend = (list, n=5) => {
  const map = list.reduce((acc,i) => {
    const v = i.vendor||"Unknown"; acc[v]=(acc[v]||0)+(i.amount||0); return acc; },{});
  return Object.entries(map).map(([vendor,total])=>({vendor,total}))
    .sort((a,b)=>b.total-a.total).slice(0,n);
};

export const buildNotifications = (list) => {
  const notes = [];
  list.forEach(inv => {
    const days = getDaysOverdue(inv.dueDate);
    if (inv.status==="OVERDUE")
      notes.push({ id:`${inv.id}_ov`, level:"error", title:`Overdue: ${inv.vendor}`,
        body:`${inv.currency} ${inv.amount?.toLocaleString("en-IN")} overdue by ${days}d`, time:inv.dueDate });
    else if (inv.status==="PENDING" && days>-DUE_SOON_DAYS && days<=0)
      notes.push({ id:`${inv.id}_due`, level:"warn", title:`Due soon: ${inv.vendor}`,
        body:`${inv.currency} ${inv.amount?.toLocaleString("en-IN")} due in ${Math.abs(days)}d`, time:inv.dueDate });
    if (inv.anomaly)
      notes.push({ id:`${inv.id}_an`, level:"warn", title:`Anomaly: ${inv.vendor}`,
        body:inv.anomaly, time:inv.uploadedAt });
  });
  const order = { error:0, warn:1, info:2 };
  return notes.sort((a,b) => order[a.level]-order[b.level]);
};

export const detectRecurringPatterns = (list) => {
  const byVendor = list.reduce((acc,inv) => {
    const k=inv.vendor||"Unknown"; acc[k]=acc[k]||[]; acc[k].push(inv); return acc; },{});
  return Object.entries(byVendor)
    .filter(([,g]) => g.length >= RECURRING_MIN_COUNT)
    .map(([vendor,g]) => {
      const amounts = g.map(i=>i.amount||0);
      const avg = amounts.reduce((s,a)=>s+a,0)/amounts.length;
      const consistent = amounts.every(a => avg===0||Math.abs(a-avg)/avg < RECURRING_VARIANCE);
      const sorted = [...g].sort((a,b)=>new Date(a.invoiceDate)-new Date(b.invoiceDate));
      return { vendor, count:g.length, avgAmount:avg, isConsistent:consistent,
        lastDate:sorted[sorted.length-1]?.invoiceDate??null,
        category:g[0]?.category??"OTHER", totalSpend:amounts.reduce((s,a)=>s+a,0) };
    }).sort((a,b)=>b.count-a.count);
};

export const isAmountAnomaly = (inv, all) => {
  const peers = all.filter(i=>i.vendor===inv.vendor&&i.id!==inv.id);
  if (peers.length<2) return false;
  const avg = sumAmounts(peers)/peers.length;
  return inv.amount > avg * ANOMALY_THRESHOLD;
};

export const sortInvoices = (list, field, dir="desc") =>
  [...list].sort((a,b) => {
    let va=a[field]??"", vb=b[field]??"";
    if (field==="amount"){ va=va||0; vb=vb||0; }
    return dir==="asc" ? (va>vb?1:-1) : (va<vb?1:-1);
  });
