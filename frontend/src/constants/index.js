export const INVOICE_STATUSES   = ["PENDING", "PAID", "OVERDUE", "PROCESSING"];
export const INVOICE_CATEGORIES = ["SAAS","UTILITIES","SERVICES","RENT","TRAVEL","OTHER"];
export const STATUS_COLORS = { PAID:"#2d7a4f", OVERDUE:"#c84b2f", PENDING:"#b85c00", PROCESSING:"#1a5c9e" };
export const CATEGORY_ICONS = { SAAS:"◈", UTILITIES:"⚡", SERVICES:"⚙", RENT:"⌂", TRAVEL:"✈", OTHER:"◉" };
export const AI_MODEL         = "claude-sonnet-4-20250514";
export const ANOMALY_THRESHOLD = 1.5;
export const DUE_SOON_DAYS     = 7;
export const RECURRING_MIN_COUNT = 2;
export const RECURRING_VARIANCE  = 0.10;
export const NAV_ITEMS = [
  { id:"dashboard",  label:"Dashboard",    icon:"▦" },
  { id:"invoices",   label:"All Invoices", icon:"≡" },
  { id:"upload",     label:"Upload",       icon:"↑" },
  { id:"payments",   label:"Payments",     icon:"₹" },
  { id:"recurring",  label:"Recurring",    icon:"↻" },
  { id:"analytics",  label:"Analytics",    icon:"◎" },
  { id:"export",     label:"Export",       icon:"↓" },
  { id:"settings",   label:"Settings",     icon:"⚙" },
];
