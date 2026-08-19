import { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

// المودال ده واحد بس بيتشارك بين كل الصفحات (Branch, Item, Employee, Customer, Price).
// بدل ما يبقى عندنا 5 modals منفصلين، عندنا حالة واحدة بتقول:
// - هل هو مفتوح؟
// - أنهي تاب مختار دلوقتي (branch / item / employee / customer / price)؟
// - إحنا في وضع "إضافة" (editing = null) ولا "تعديل" (editing فيها بيانات)؟
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
