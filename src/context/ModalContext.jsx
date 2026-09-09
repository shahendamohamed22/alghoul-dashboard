import { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('branch');
  const [editing, setEditing] = useState(null); // { type: 'branch', data: {...} } أو null

  function openAdd(tab = 'branch') {
    setEditing(null);
    setActiveTab(tab);
    setIsOpen(true);
  }

  function openEdit(type, data) {
    setEditing({ type, data });
    setActiveTab(type);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setEditing(null);
  }

  const value = { isOpen, activeTab, setActiveTab, editing, openAdd, openEdit, close };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  return useContext(ModalContext);
}
