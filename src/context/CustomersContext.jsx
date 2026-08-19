import { createContext, useContext, useState } from 'react';
import { customers as initialCustomers } from '../data/customers';

const CustomersContext = createContext(null);

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState(
    initialCustomers.map((c, i) => ({ id: i + 1, ...c }))
  );

  function addCustomer(data) {
    setCustomers((prev) => [...prev, { id: Date.now(), ...data }]);
  }

  function updateCustomer(id, data) {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }

  function deleteCustomer(id) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  const value = { customers, addCustomer, updateCustomer, deleteCustomer };
  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}

export function useCustomers() {
  return useContext(CustomersContext);
}
