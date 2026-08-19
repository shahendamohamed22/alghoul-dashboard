import { createContext, useContext, useState } from 'react';
import { pricingItems as initialPricingItems } from '../data/pricing';

const PricingContext = createContext(null);

export function PricingProvider({ children }) {
  const [pricingItems, setPricingItems] = useState(
    initialPricingItems.map((p, i) => ({ id: i + 1, ...p }))
  );

  function addPricingItem(data) {
    setPricingItems((prev) => [...prev, { id: Date.now(), ...data }]);
  }

  function updatePricingItem(id, data) {
    setPricingItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  function deletePricingItem(id) {
    setPricingItems((prev) => prev.filter((p) => p.id !== id));
  }

  const value = { pricingItems, addPricingItem, updatePricingItem, deletePricingItem };
  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  return useContext(PricingContext);
}
