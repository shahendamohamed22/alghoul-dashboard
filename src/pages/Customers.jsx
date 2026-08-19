import { useState, useMemo } from 'react';
import { useCustomers } from '../context/CustomersContext';
import { useModal } from '../context/ModalContext';
import FilterBar from '../components/FilterBar';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';

const primaryOptions = [
  { value: 'all', label: 'All customers' },
  { value: 'branch', label: 'By Branch' },
  { value: 'topSpenders', label: 'Top spenders' },
  { value: 'newThisMonth', label: 'New this month' },
];

const customerGrowthConfig = {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [82, 95, 90, 112, 145, 138],
      borderColor: '#1f6b4d',
      backgroundColor: 'rgba(31, 107, 77, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  },
  options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
};

export default function Customers() {
  const { customers, deleteCustomer } = useCustomers();
  const { openAdd, openEdit } = useModal();
  const [primaryFilter, setPrimaryFilter] = useState('all');
  const [secondaryFilter, setSecondaryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const secondaryOptions = useMemo(() => {
    if (primaryFilter === 'branch') return [...new Set(customers.map((c) => c.branch))];
    return [];
  }, [customers, primaryFilter]);

  const handlePrimaryChange = (value) => {
    setPrimaryFilter(value);
    setSecondaryFilter('all');
  };

  const filteredCustomers = useMemo(() => {
    let result = customers;

    // ملحوظة: في الكود الأصلي، خياري "topSpenders" و"newThisMonth" كان
    // معمول لهم data-primary في الـ HTML بس مفيش شرط فلترة فعلي ليهم في الـ JS
    // (كان فيه بس primaryFilter === 'shift' اللي مش موجود أصلاً كخيار).
    // هنا ضفناهم فلترة حقيقية بدل ما نسيبهم من غير أي تأثير.
    if (primaryFilter === 'topSpenders') {
      result = [...result].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
    } else if (primaryFilter === 'newThisMonth') {
      result = result.filter((c) => c.lastVisit >= '2026-06-15');
    } else if (primaryFilter === 'branch' && secondaryFilter !== 'all') {
      result = result.filter((c) => c.branch === secondaryFilter);
    }

    if (search.trim() !== '') {
      result = result.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    }

    return result;
  }, [customers, primaryFilter, secondaryFilter, search]);

  const stats = useMemo(() => ({
    total: filteredCustomers.length,
    active: filteredCustomers.filter((c) => c.status === 'Active').length,
  }), [filteredCustomers]);

  const tierTotals = useMemo(() => {
    const tiers = { 'VIP ($500+)': 0, 'Regular ($100-499)': 0, 'Occasional (<$100)': 0 };
    customers.forEach((c) => {
      if (c.totalSpent >= 500) tiers['VIP ($500+)'] += c.totalSpent;
      else if (c.totalSpent >= 100) tiers['Regular ($100-499)'] += c.totalSpent;
      else tiers['Occasional (<$100)'] += c.totalSpent;
    });
    return tiers;
  }, [customers]);

  const spendingTierConfig = {
    type: 'bar',
    data: {
      labels: Object.keys(tierTotals),
      datasets: [{ data: Object.values(tierTotals), backgroundColor: ['#16342c', '#3d9970', '#7fc79e'], borderRadius: 4 }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Customers</h1>
        <div className="text-muted small">Customer directory</div>
      </div>

      <FilterBar
        primaryOptions={primaryOptions}
        primaryFilter={primaryFilter}
        onPrimaryChange={handlePrimaryChange}
        secondaryOptions={secondaryOptions}
        secondaryFilter={secondaryFilter}
        onSecondaryChange={setSecondaryFilter}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers..."
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="fa-user-group" value={stats.total} label="Total customers" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-user-plus" value={stats.active} label="New this month" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-credit-card" value="$65.80" label="Avg Spend/Customer" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-chart-line" value="342" label="Active Today" /></div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Customer Directory</h6>
          <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('customer')}>
            <i className="fa-solid fa-user-plus"></i> Add customer
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>CUSTOMER</th><th>BRANCH</th><th>TOTAL ORDERS</th>
                <th>TOTAL SPENT</th><th>LAST VISIT</th><th>STATUS</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cus) => {
                const statusClass = cus.status === 'Active' ? 'success' : 'warning';
                return (
                  <tr key={cus.id}>
                    <td>{cus.name}</td>
                    <td>{cus.branch}</td>
                    <td>{cus.totalOrders ?? 0}</td>
                    <td>${(cus.totalSpent ?? 0).toLocaleString()}</td>
                    <td>{cus.lastVisit}</td>
                    <td><span className={`badge bg-${statusClass}-subtle text-${statusClass}`}>{cus.status}</span></td>
                    <td>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('customer', cus)}></i>
                      <i
                        className="fa-solid fa-trash text-danger row-action-icon"
                        role="button"
                        onClick={() => window.confirm('متأكدة إنك عايزة تحذفي العميل ده؟') && deleteCustomer(cus.id)}
                      ></i>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Customer Growth</h6>
            <div style={{ height: 240 }}><ChartCanvas config={customerGrowthConfig} /></div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Spending by Customer Tier</h6>
            <div style={{ height: 240 }}><ChartCanvas config={spendingTierConfig} /></div>
          </div>
        </div>
      </div>
    </>
  );
}
