import { getStatusColor } from "../../utils/invoiceHelpers";
export function StatusBadge({ status }) {
  const c = getStatusColor(status);
  return <span style={{ fontSize:10.5, fontFamily:"var(--mono)", fontWeight:700, color:c, background:c+"18", padding:"3px 8px", borderRadius:4 }}>{status}</span>;
}
