import { NavLink, useLocation } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

// كل روابط النافيجيشن في array واحد بدل ما نكررهم 6 مرات في 6 صفحات
// (ده كان أكبر مصدر للأخطاء في النسخة الأصلية: كل صفحة كانت بتعمل paste
// للسايدبار وتنسى تشيل active من الرابط الصح أو تنسى نفس الـ icon)
const navItems = [
  { to: '/', icon: 'fa-grid-vertical', label: 'Dashboard', end: true },
  { to: '/branches', icon: 'fa-shop', label: 'Branches' },
  { to: '/store', icon: 'fa-box-open', label: 'Store' },
  { to: '/employees', icon: 'fa-user-gear', label: 'Employees' },
  { to: '/customers', icon: 'fa-users', label: 'Customers' },
  { to: '/pricing', icon: 'fa-tag', label: 'Pricing' },
];

// isOpen و onClose جايين من الـ Layout (parent) - السايدبار نفسه معندوش state
// بيعرف هو مفتوح ولا لأ. ده مبدأ مهم في React: الـ state بيعيش في أعلى نقطة
// مشتركة بين العناصر اللي محتاجاها (هنا: Sidebar + الزرار اللي بيفتحها في Layout)
// كل صفحة بتتوافق مع تاب معين في مودال الإضافة - عشان لو إنتي واقفة في صفحة
// Store مثلًا ودست "Add New"، يفتح على تاب "Item" مباشرة بدل ما تدوري عليه
const routeToTab = {
  '/branches': 'branch',
  '/store': 'item',
  '/employees': 'employee',
  '/customers': 'customer',
  '/pricing': 'price',
};

export default function Sidebar({ isOpen, onClose }) {
  const { openAdd } = useModal();
  const location = useLocation();

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
          <div className="d-flex align-items-center gap-2">
            <div className="bg-brand-green text-white rounded-circle d-flex align-items-center justify-content-center fw-semibold"
              style={{ width: 34, height: 34, fontSize: 13 }}>A</div>
            <div>
              <div className="small fw-semibold">Admin User</div>
              <div className="text-muted" style={{ fontSize: 12 }}>Manager</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
