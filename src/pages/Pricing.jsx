import { useState, useMemo, useEffect } from 'react';
import { usePricing } from '../context/PricingContext';
import { useCategories } from '../context/CategoriesContext';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';
import EditPriceModal from '../components/EditPriceModal';

export default function Pricing() {
  const { pricingItems, fetchTable, fetchMarginByCategory, fetchRevenueByTier, fetchStats } = usePricing();
  const { flatCategories } = useCategories();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowMarginOnly, setLowMarginOnly] = useState(false);
  const [recentlyUpdatedOnly, setRecentlyUpdatedOnly] = useState(false);

  const [stats, setStats] = useState(null);
  const [marginByCategory, setMarginByCategory] = useState([]);
  const [revenueByTier, setRevenueByTier] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
    fetchMarginByCategory().then(setMarginByCategory).catch(() => setMarginByCategory([]));
    fetchRevenueByTier().then(setRevenueByTier).catch(() => setRevenueByTier([]));
  }, [pricingItems]);

  const [displayed, setDisplayed] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTable({
        searchTerm: search.trim() || undefined,
        categoryId: categoryFilter || undefined,
        lowMargin: lowMarginOnly || undefined,
        recentlyUpdated: recentlyUpdatedOnly || undefined,
      }).then(setDisplayed);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search, categoryFilter, lowMarginOnly, recentlyUpdatedOnly]);

  const filteredItems = displayed ?? pricingItems;

  const marginChartConfig = useMemo(() => ({
    type: 'bar',
    data: {
      labels: marginByCategory.map((m) => m.categoryName),
      datasets: [{ data: marginByCategory.map((m) => m.avgMarginPercentage), backgroundColor: '#1f6b4d', borderRadius: 4 }],
    },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => v + '%' } } } },
  }), [marginByCategory]);

  const tierChartConfig = useMemo(() => ({
    type: 'doughnut',
    data: {
      labels: revenueByTier.map((t) => t.tier),
      datasets: [{ data: revenueByTier.map((t) => t.percentage), backgroundColor: ['#16342c', '#1f6b4d', '#b8e0c8'] }],
    },
    options: { maintainAspectRatio: false, cutout: '65%' },
  }), [revenueByTier]);

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Prices</h1>
        <div className="text-muted small">Manage product prices</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4"><StatCard icon="fa-box-open" value={stats?.totalProducts ?? '-'} label="Total Products" /></div>
        <div className="col-6 col-lg-4"><StatCard icon="fa-percentage" value={stats ? `${stats.avgMarginPercentage}%` : '-'} label="Avg Margin" /></div>
        <div className="col-6 col-lg-4"><StatCard icon="fa-rotate" value={stats?.priceChangesToday ?? '-'} label="Price Changes Today" /></div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="fw-bold mb-0">Product Pricing</h6>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
              <input type="text" className="form-control ps-4" style={{ minWidth: 160 }} placeholder="ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">كل التصنيفات</option>
              {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="lowMargin" checked={lowMarginOnly} onChange={(e) => setLowMarginOnly(e.target.checked)} />
              <label className="form-check-label small" htmlFor="lowMargin">هامش منخفض (&lt;20%)</label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="recent" checked={recentlyUpdatedOnly} onChange={(e) => setRecentlyUpdatedOnly(e.target.checked)} />
              <label className="form-check-label small" htmlFor="recent">آخر 7 أيام</label>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>Item Name</th><th>Category</th><th>Purchase Price</th><th>Selling Price</th>
                <th>Margin</th><th>Vendor</th><th>Last Updated</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const marginClass = item.margin < 20 ? 'text-warning' : 'text-success';
                return (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td><span className="badge bg-brand-light text-brand-green">{item.category}</span></td>
                    <td>${(item.purchasePrice ?? 0).toFixed(2)}</td>
                    <td>${(item.sellingPrice ?? 0).toFixed(2)}</td>
                    <td className={`fw-semibold ${marginClass}`}>{(item.margin ?? 0).toFixed(1)}%</td>
                    <td>{item.brand}</td>
                    <td className="text-muted">{item.lastUpdated?.slice(0, 10)}</td>
                    <td>
                      <i className="fa-solid fa-pen text-muted row-action-icon" role="button" onClick={() => setEditingItem(item)}></i>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Margin by Category</h6>
            <div style={{ height: 260 }}><ChartCanvas config={marginChartConfig} /></div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Revenue by Price Tier</h6>
            <div style={{ height: 260 }}><ChartCanvas config={tierChartConfig} /></div>
          </div>
        </div>
      </div>

      <EditPriceModal item={editingItem} onClose={() => setEditingItem(null)} />
    </>
  );
}