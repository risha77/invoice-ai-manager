import { getCategoryIcon } from "../../utils/invoiceHelpers";
export function CategoryBadge({ category }) {
  return <span style={{ fontSize:11, fontFamily:"var(--mono)", padding:"3px 8px", background:"var(--paper2)", borderRadius:4, color:"var(--ink2)" }}>{getCategoryIcon(category)} {category}</span>;
}
