export const formatCurrency = (n, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style:"currency", currency, maximumFractionDigits:0 }).format(n || 0);

export const formatDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }
  catch { return d; }
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(0)} KB`;
  return `${(bytes/(1024*1024)).toFixed(1)} MB`;
};

export const truncate = (str, n = 40) => str && str.length > n ? str.slice(0,n)+"…" : str || "";
