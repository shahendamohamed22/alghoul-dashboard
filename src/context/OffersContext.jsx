import { createContext, useContext, useState } from 'react';
import { offers as initialOffers } from '../data/offers';

const OffersContext = createContext(null);

export function OffersProvider({ children }) {
  const [offers, setOffers] = useState(initialOffers);

  function addOffer(data) {
    setOffers((prev) => [...prev, { id: Date.now(), ...data }]);
  }

  function updateOffer(id, data) {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
  }

  function deleteOffer(id) {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  const value = { offers, addOffer, updateOffer, deleteOffer };
  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  return useContext(OffersContext);
}