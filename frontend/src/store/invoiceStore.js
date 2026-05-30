import { createContext, useContext, useReducer, useCallback } from "react";
import { SEEDS } from "./seedData";

export const Actions = {
  ADD_INVOICE:"ADD_INVOICE", DELETE_INVOICE:"DELETE_INVOICE",
  UPDATE_STATUS:"UPDATE_STATUS", SET_INVOICES:"SET_INVOICES",
  UPDATE_SETTINGS:"UPDATE_SETTINGS",
};

const DEFAULT_SETTINGS = {
  companyName:"", currency:"INR", gstin:"",
  anomalyDetection:true, autoSummary:true, recurringDetection:true,
  overdueAlerts:true, dueSoonDays:"7", notifyEmail:"",
  apiBaseUrl:"", apiToken:"",
};

function reducer(state, { type, payload }) {
  switch (type) {
    case Actions.ADD_INVOICE:     return {...state, invoices:[payload,...state.invoices]};
    case Actions.DELETE_INVOICE:  return {...state, invoices:state.invoices.filter(i=>i.id!==payload)};
    case Actions.UPDATE_STATUS:   return {...state, invoices:state.invoices.map(i=>i.id===payload.id?{...i,status:payload.status}:i)};
    case Actions.SET_INVOICES:    return {...state, invoices:payload};
    case Actions.UPDATE_SETTINGS: return {...state, settings:{...state.settings,...payload}};
    default: return state;
  }
}

const Ctx = createContext(null);

export function InvoiceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { invoices:SEEDS, settings:DEFAULT_SETTINGS });
  const addInvoice     = useCallback(inv  => dispatch({type:Actions.ADD_INVOICE,    payload:inv}),       []);
  const deleteInvoice  = useCallback(id   => dispatch({type:Actions.DELETE_INVOICE, payload:id}),        []);
  const updateStatus   = useCallback((id,s)=> dispatch({type:Actions.UPDATE_STATUS, payload:{id,status:s}}),[]);
  const updateSettings = useCallback(patch => dispatch({type:Actions.UPDATE_SETTINGS,payload:patch}),    []);
  return <Ctx.Provider value={{state,dispatch,addInvoice,deleteInvoice,updateStatus,updateSettings}}>{children}</Ctx.Provider>;
}

export function useInvoiceStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInvoiceStore must be inside <InvoiceProvider>");
  return ctx;
}
