import { NavLink, useLocation } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: 'fa-grid-vertical', label: 'Dashboard', end: true },
  { to: '/branches', icon: 'fa-shop', label: 'Branches' },
  { to: '/store', icon: 'fa-box-open', label: 'Store' },
  { to: '/products', icon: 'fa-basket-shopping', label: 'Products' },
  { to: '/offers', icon: 'fa-percent', label: 'Offers' },
  { to: '/employees', icon: 'fa-user-gear', label: 'Employees' },
  { to: '/customers', icon: 'fa-users', label: 'Customers' },
  { to: '/pricing', icon: 'fa-tag', label: 'Pricing' },
];

const routeToTab = {
  '/branches': 'branch',
  '/store': 'item',
  '/employees': 'employee',
  '/customers': 'customer',
  '/pricing': 'price',
  '/offers': 'offer',
  '/products': 'product',
};

export default function Sidebar({ isOpen, onClose }) {
  const { openAdd } = useModal();
  const location = useLocation();

  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleAddNew() {
    const tab = routeToTab[location.pathname] || 'branch';
    openAdd(tab);
  }

  return (
    <>
      {/* الخلفية السودة (overlay) بتظهر بس على الموبايل لما السايدبار مفتوحة
          دوسة عليها = قفل السايدبار. على الديسكتوب هي أصلاً مخفية بالـ CSS */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      <div className={`sidebar bg-white border-end d-flex flex-column p-3 ${isOpen ? 'sidebar-open' : ''}`}>

        {/* Brand */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="bg-brand-dark text-white rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 38, height: 38 }}>
            <i className="fa-solid fa-cow"></i>
          </div>
          <div>
            <div className="fw-bold small">El-Ghoul</div>
            <div className="text-muted fs-xsm">Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="nav flex-column flex-grow-1 gap-1">
          <ul className="list-unstyled">
            {navItems.map((item) => (
              <li key={item.to}>
                {/* NavLink من react-router بيحط className تلقائي لو الرابط ده هو الحالي
                    - ده بديل الـ "class="nav-link active"" اللي كنا بنكتبه يدوي في كل صفحة */}
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-link rounded-3 d-flex align-items-center gap-2 text-dark${isActive ? ' active' : ''}`
                  }
                >
                  <i className={`fa-solid ${item.icon}`}></i> {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div>
          <button
            className="btn bg-brand-dark text-white w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
            onClick={handleAddNew}
          >
            <i className="fa-solid fa-plus"></i> Add New
          </button>
          <div className="d-flex align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-brand-green text-white rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                style={{ width: 34, height: 34, fontSize: 13 }}>
                {admin?.firstName?.[0] ?? 'A'}
              </div>
              <div>
                <div className="small fw-semibold">{admin ? `${admin.firstName} ${admin.lastName}` : 'Admin User'}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{admin?.email}</div>
              </div>
            </div>
            <i
              className="fa-solid fa-right-from-bracket text-muted"
              role="button"
              title="تسجيل الخروج"
              onClick={() => { logout(); navigate('/login'); }}
            ></i>
          </div>
        </div>
      </div>
    </>
  );
}
