import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AddNewModal from './AddNewModal';

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="bg-light min-vh-100">
      <div className="mobile-topbar d-flex align-items-center gap-3 bg-white border-bottom p-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="fw-bold small">El-Ghoul Admin</div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content p-3">
        {children}
      </main>

      <AddNewModal />
    </div>
  );
}
