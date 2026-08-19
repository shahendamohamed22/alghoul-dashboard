import { createContext, useContext, useState } from 'react';
import { items as initialItems } from '../data/items';

const ItemsContext = createContext(null);

export function ItemsProvider({ children }) {
  const [items, setItems] = useState(
    initialItems.map((it, i) => ({ id: i + 1, ...it }))
  );

  function addItem(data) {
    setItems((prev) => [...prev, { id: Date.now(), ...data }]);
  }

  function updateItem(id, data) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...data } : it)));
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const value = { items, addItem, updateItem, deleteItem };
  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems() {
  return useContext(ItemsContext);
}
