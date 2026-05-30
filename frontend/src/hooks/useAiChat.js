import { useState, useCallback } from "react";
import { askInvoiceAssistant }   from "../services/claudeService";

const WELCOME = { role:"assistant", text:"Hi! I'm your invoice assistant. Ask me anything — overdue amounts, vendor spend, anomalies, or payment priorities." };

export function useAiChat(invoices) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input,    setInput]    = useState("");
  const [busy,     setBusy]     = useState(false);

  const sendMessage = useCallback(async () => {
    const q=input.trim(); if(!q||busy) return;
    setInput(""); setMessages(p=>[...p,{role:"user",text:q}]); setBusy(true);
    try {
      const ans = await askInvoiceAssistant(q, invoices);
      setMessages(p=>[...p,{role:"assistant",text:ans}]);
    } catch(e) {
      setMessages(p=>[...p,{role:"assistant",text:`Sorry, error: ${e.message}`}]);
    }
    setBusy(false);
  }, [input,busy,invoices]);

  return { messages, input, setInput, busy, sendMessage };
}
