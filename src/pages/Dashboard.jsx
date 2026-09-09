import { useState, useEffect, useMemo } from 'react';
import { useBranches } from '../context/BranchesContext';
import apiClient from '../data/apiClient';
import ChartCanvas from '../components/ChartCanvas';
import Legend from '../components/Legend';

const periodOptions = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
];

const categoryColors = ['#16342c', '#1f6b4d', '#3d9970', '#7fc79e', '#b8e0c8', '#e5f0ea'];

// const recentActivity = [
//   { text: 'New order #4821 at Downtown', amount: '$142.50' },
//   { text: 'Low stock alert at Westside', amount: null },
//   { text: 'New customer registered', amount: null },
// ];

function formatChange(value) {
  if (value === null || value === undefined) return null;
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}%`;
}

export default function Dashboard() {
  const { branches } = useBranches();
  const [period, setPeriod] = useState(7);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/api/dashboard/overview', { params: { period } })
      .then((res) => setOverview(res.data))
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, [period]);

  const topBranches = useMemo(() => {
    return [...branches]
      .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
      .slice(0, 5)
      .map((b, i) => ({ rank: i + 1, name: b.name, revenue: b.revenue ?? 0 }));
  }, [branches]);

  const revenueChartConfig = useMemo(() => ({
    type: 'line',
    data: {
      labels: (overview?.revenueTrend ?? []).map((d) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Revenue',
        fill: true,
        data: (overview?.revenueTrend ?? []).map((d) => d.revenue),
        borderColor: '#1f6b4d',
        backgroundColor: 'rgba(31, 107, 77, 0.1)',
        tension: 0.4,
      }],
    },
    options: { plugins: { legend: { display: false } } },
  }), [overview]);

  const categoryData = (overview?.ordersByCategory ?? []).map((c, i) => ({
    name: c.categoryName,
    value: c.percentage,
    color: categoryColors[i % categoryColors.length],
  }));

  const categoryChartConfig = useMemo(() => ({
    type: 'doughnut',
    data: {
      labels: categoryData.map((c) => c.name),
      datasets: [{ data: categoryData.map((c) => c.value), backgroundColor: categoryData.map((c) => c.color) }],
    },
    options: { maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } },
  }), [categoryData]);

  const alerts = overview?.alerts;
  const today = overview?.todayOverview;
  const header = overview?.headerStats;

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">Dashboard</h1>
          <div className="text-muted small">Overview of all branches</div>
        </div>
        <div className="d-flex gap-2">
          {periodOptions.map((p) => (
            <button
              key={p.value}
              className={`filter-btn btn btn-success${period === p.value ? ' active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted p-5">جاري التحميل...</div>
      ) : (
        <>
          <div className="row">
            <div className="col-6 col-lg-3">
              <div className="border border-1 rounded-3 shadow p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <i className="fa-solid fa-dollar-sign fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
                  {formatChange(header?.revenueChangePercentage) && (
                    <span className={`py-1 px-2 rounded-4 ${header.revenueChangePercentage >= 0 ? 'bg-brand-light text-brand-green' : 'bg-danger-subtle text-danger'}`}>
                      <i className={`fa-solid ${header.revenueChangePercentage >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i> {formatChange(header.revenueChangePercentage)}
                    </span>
                  )}
                </div>
                <h3 className="fs-2 mt-1">${(header?.totalRevenue ?? 0).toLocaleString()}</h3>
                <p className="text-secondary fs-6">Total Revenue</p>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="border border-1 rounded-3 shadow p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <i className="fa-solid fa-bag-shopping fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
                  {formatChange(header?.ordersChangePercentage) && (
                    <span className={`py-1 px-2 rounded-4 ${header.ordersChangePercentage >= 0 ? 'bg-brand-light text-brand-green' : 'bg-danger-subtle text-danger'}`}>
                      <i className={`fa-solid ${header.ordersChangePercentage >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i> {formatChange(header.ordersChangePercentage)}
                    </span>
                  )}
                </div>
                <h3 className="fs-2 mt-1">{header?.totalOrders ?? 0}</h3>
                <p className="text-secondary fs-6">Total Orders</p>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="border border-1 rounded-3 shadow p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <i className="fa-solid fa-users fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
                  {formatChange(header?.customersChangePercentage) && (
                    <span className={`py-1 px-2 rounded-4 ${header.customersChangePercentage >= 0 ? 'bg-brand-light text-brand-green' : 'bg-danger-subtle text-danger'}`}>
                      <i className={`fa-solid ${header.customersChangePercentage >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i> {formatChange(header.customersChangePercentage)}
                    </span>
                  )}
                </div>
                <h3 className="fs-2 mt-1">{header?.activeCustomers ?? 0}</h3>
                <p className="text-secondary fs-6">Active Customers</p>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="border border-1 rounded-3 shadow p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <i className="fa-solid fa-credit-card fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
                  {formatChange(header?.avgOrderValueChangePercentage) && (
                    <span className={`py-1 px-2 rounded-4 ${header.avgOrderValueChangePercentage >= 0 ? 'bg-brand-light text-brand-green' : 'bg-danger-subtle text-danger'}`}>
                      <i className={`fa-solid ${header.avgOrderValueChangePercentage >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i> {formatChange(header.avgOrderValueChangePercentage)}
                    </span>
                  )}
                </div>
                <h3 className="fs-2 mt-1">${(header?.avgOrderValue ?? 0).toFixed(2)}</h3>
                <p className="text-secondary fs-6">Avg Order Value</p>
              </div>
            </div>
          </div>

          <div className="row mt-5 align-items-center">
            <div className="col-lg-6">
              <div className="revenueChart w-100 border border-1 rounded-4 p-3 shadow h-100"
                style={{ height: 240 }}>
                <ChartCanvas config={revenueChartConfig} />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="d-flex align-items-center justify-content-center gap-3 w-100 border border-1 rounded-4 p-4 shadow h-100 flex-wrap">
                <div style={{ width: 240 }}>
                  <ChartCanvas config={categoryChartConfig} />
                </div>
                <Legend items={categoryData} />
              </div>
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-lg-4">
              <div className="bg-white border rounded-4 p-3 h-100">
                <h6 className="fw-bold mb-3">Top Performing Branches</h6>
                <ul className="list-unstyled mb-0">
                  {topBranches.map((b) => (
                    <li key={b.rank} className="d-flex justify-content-between align-items-center mb-3">
                      <span className="d-flex align-items-center gap-2">
                        <span className="bg-brand-light text-brand-green rounded-circle d-flex align-items-center justify-content-center fw-semibold" style={{ width: 26, height: 26, fontSize: 12 }}>
                          {b.rank}
                        </span>
                        <span className="small">{b.name}</span>
                      </span>
                      <span className="fw-semibold small">${b.revenue.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* <div className="col-lg-4">
              <div className="bg-white border rounded-4 p-3 h-100">
                <h6 className="fw-bold mb-3">Recent Activity</h6>
                <ul className="list-unstyled mb-0">
                  {recentActivity.map((item, i) => (
                    <li key={i} className="d-flex align-items-start gap-2 mb-3 small">
                      <span className="bg-brand-green rounded-circle d-inline-block mt-1" style={{ width: 6, height: 6 }}></span>
                      <span>{item.text}{item.amount && <> — <strong>{item.amount}</strong></>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div> */}

            <div className="col-lg-4">
              <div className="bg-white border rounded-4 p-3 h-100">
                <h6 className="fw-bold mb-3">Today's Overview</h6>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex justify-content-between align-items-center mb-3 small">
                    <span className="d-flex align-items-center gap-2 text-muted"><i className="fa-solid fa-store"></i> Open Branches</span>
                    <span className="fw-semibold">{today?.openBranches ?? '-'}</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center mb-3 small">
                    <span className="d-flex align-items-center gap-2 text-muted"><i className="fa-solid fa-bag-shopping"></i> Items Sold</span>
                    <span className="fw-semibold">{today?.itemsSold ?? 0}</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center mb-3 small">
                    <span className="d-flex align-items-center gap-2 text-muted"><i className="fa-solid fa-triangle-exclamation"></i> Stock Alerts</span>
                    <span className="fw-semibold">{today?.stockAlertsCount ?? 0}</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center mb-3 small">
                    <span className="d-flex align-items-center gap-2 text-muted"><i className="fa-solid fa-dollar-sign"></i> Today's Revenue</span>
                    <span className="fw-semibold">${(today?.todayRevenue ?? 0).toLocaleString()}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className='col-lg-4'>
              {alerts && alerts.totalAlertsCount > 0 && (
                <div className="bg-white border rounded-4 p-3 ">
                  <h6 className="fw-bold mb-3 text-danger"><i className="fa-solid fa-triangle-exclamation"></i> Alerts ({alerts.totalAlertsCount})</h6>
                  <div className="row g-3 small">
                    <div className="col-6"><span className="text-muted">Low Stock: </span><strong>{alerts.lowStockCount}</strong></div>
                    <div className="col-6"><span className="text-muted">Out of Stock: </span><strong>{alerts.outOfStockCount}</strong></div>
                    <div className="col-6"><span className="text-muted">Branches Needing Attention: </span><strong>{alerts.branchesNeedingAttentionCount}</strong></div>
                    <div className="col-6"><span className="text-muted">Employees On Leave: </span><strong>{alerts.employeesOnLeaveCount}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </>
  );
}