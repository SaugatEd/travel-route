import { useState, useEffect } from "react";

export function useRates() {
  const [rates, setRates] = useState({ EUR: 173, CHF: 203, CZK: 6.9, USD: 154 });
  const [src, setSrc] = useState("loading…");
  useEffect(() => {
    fetch("https://api.frankfurter.app/latest?from=NPR&to=EUR,CHF,CZK,USD")
      .then(r => r.json()).then(d => {
        const inv = {}; Object.entries(d.rates).forEach(([k,v]) => { inv[k] = Math.round((1/v)*100)/100; });
        setRates(inv); setSrc(`Live · ${d.date}`);
      }).catch(() => setSrc("₨173/€ (fallback)"));
  }, []);
  const npr = (val, cur = "EUR") => `₨${Math.round(val * (rates[cur] || 173)).toLocaleString()}`;
  return { rates, src, npr };
}
