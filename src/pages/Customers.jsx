import { useState, useMemo, useEffect } from 'react';
import { useCustomers } from '../context/CustomersContext';
import { useBranches } from '../context/BranchesContext';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';

const tierColors = { VIP: 'success', Regular: 'primary', Occasional: 'secondary' };

export default function Customers() {
  const { customers, toggleStatus, fetchByBranch, fetchTopSpenders, fetchNewThisMonth, searchCustomers, fetchStats } = useCustomers();
  const { branches } = useBranches();

  const [primaryFilter, setPrimaryFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [filteredFromApi, setFilteredFromApi] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, [customers]);

  useEffect(() => {
    if (primaryFilter === 'topSpenders') {
      fetchTopSpenders().then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else if (primaryFilter === 'newThisMonth') {
      fetchNewThisMonth().then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else if (primaryFilter === 'branch' && branchFilter !== 'all') {
      const branch = branches.find((b) => b.name === branchFilter);
      if (branch) fetchByBranch(branch.id).then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else {
      setFilteredFromApi(null);
    }
  }, [primaryFilter, branchFilter, branches]);

  useEffect(() => {
    if (search.trim() === '') {
      setSearchResults(null);
      return;
    }
    const timeoutId = setTimeout(() => {
      searchCustomers(search).then(setSearchResults).catch(() => setSearchResults([]));
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const filteredCustomers = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return filteredFromApi ?? customers;
  }, [customers, filteredFromApi, searchResults]);

  const growthChartConfig = useMemo(() => ({
    type: 'line',
    data: {
      labels: (stats?.monthlyGrowth ?? []).map((m) => m.month),
      datasets: [{
        data: (stats?.monthlyGrowth ?? []).map((m) => m.count),
        borderColor: '#1f6b4d',
        backgroundColor: 'rgba(31, 107, 77, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
  }), [stats]);

  const tierChartConfig = useMemo(() => {
    const t = stats?.tierStats ?? { vipCount: 0, regularCount: 0, occasionalCount: 0 };
    return {
      type: 'bar',
      data: {
        labels: ['VIP', 'Regular', 'Occasional'],
        datasets: [{ data: [t.vipCount, t.regularCount, t.occasionalCount], backgroundColor: ['#16342c', '#3d9970', '#7fc79e'], borderRadius: 4 }],
      },
      options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } },
    };
  }, [stats]);

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Customers</h1>
        <div className="text-muted small">Customer directory</div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex gap-2 flex-wrap">
          <button className={`filter-btn btn btn-success${primaryFilter === 'all' ? ' active' : ''}`} onClick={() => { setPrimaryFilter('all'); setBranchFilter('all'); }}>All customers</button>
          <button className={`filter-btn btn btn-success${primaryFilter === 'topSpenders' ? ' active' : ''}`} onClick={() => setPrimaryFilter('topSpenders')}>Top spenders</button>
          <button className={`filter-btn btn btn-success${primaryFilter === 'newThisMonth' ? ' active' : ''}`} onClick={() => setPrimaryFilter('newThisMonth')}>New this month</button>
          <button className={`filter-btn btn btn-success${primaryFilter === 'branch' ? ' active' : ''}`} onClick={() => setPrimaryFilter('branch')}>By Branch</button>
          {primaryFilter === 'branch' && (
            <select className="form-select" style={{ width: 160 }} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
              <option value="all">اختار فرع</option>
              {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          )}
        </div>
        <div className="position-relative">
          <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
          <input type="text" className="form-control ps-4" style={{ minWidth: 200 }} placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="fa-user-group" value={stats?.totalCustomers ?? '-'} label="Total customers" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-user-plus" value={stats?.newThisMonth ?? '-'} label={`New this month (${stats?.newThisMonthPercentage ?? 0}%)`} /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-credit-card" value={`$${(stats?.avgSpendPerCustomer ?? 0).toFixed(2)}`} label="Avg Spend/Customer" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-chart-line" value={stats?.activeToday ?? '-'} label="Active Today" /></div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <h6 className="fw-bold mb-3">Customer Directory</h6>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>CUSTOMER</th><th>BRANCH</th><th>TIER</th><th>TOTAL ORDERS</th>
                <th>TOTAL SPENT</th><th>LAST VISIT</th><th>STATUS</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cus) => {
                const tierColor = tierColors[cus.tier] || 'secondary';
                return (
                  <tr key={cus.id}>
                    <td>
                      <div>{cus.name}</div>
                      <div className="text-muted small">{cus.email}</div>
                    </td>
                    <td>{cus.branch ?? '-'}</td>
                    <td><span className={`badge bg-${tierColor}-subtle text-${tierColor}`}>{cus.tier}</span></td>
                    <td>{cus.totalOrders ?? 0}</td>
                    <td>${(cus.totalSpent ?? 0).toLocaleString()}</td>
                    <td>{cus.lastVisit ? new Date(cus.lastVisit).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`badge bg-${cus.isActive ? 'success' : 'warning'}-subtle text-${cus.isActive ? 'success' : 'warning'}`}>
                        {cus.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${cus.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => toggleStatus(cus.id)}
                      >
                        {cus.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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
            <div style={{ height: 240 }}><ChartCanvas config={growthChartConfig} /></div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Customers by Tier</h6>
            <div style={{ height: 240 }}><ChartCanvas config={tierChartConfig} /></div>
          </div>
        </div>
      </div>
    </>
  );
}