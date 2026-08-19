import { useState, useMemo } from 'react';
import { usePricing } from '../context/PricingContext';
import { useModal } from '../context/ModalContext';
import { calcMargin } from '../data/pricing';
import FilterBar from '../components/FilterBar';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';
import Legend from '../components/Legend';

const primaryOptions = [
  { value: 'all', label: 'All Items' },
  { value: 'category', label: 'By Category' },
  { value: 'margin', label: 'margin < 30%' },
  { value: 'recentlyUpdated', label: 'Recently Updated' },
];

const tierColors = ['#16342c', '#1f6b4d', '#b8e0c8'];

export default function Pricing() {
  const { pricingItems, deletePricingItem } = usePricing();
  const { openAdd, openEdit } = useModal();
  const [primaryFilter, setPrimaryFilter] = useState('all');
  const [secondaryFilter, setSecondaryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // الفلتر الفرعي هنا مطلوب بس لو primaryFilter === 'category' (زي الأصل بالظبط)
  const secondaryOptions = useMemo(() => {
    if (primaryFilter !== 'category') return [];
    return [...new Set(pricingItems.map((i) => i.category))];
  }, [pricingItems, primaryFilter]);

  const handlePrimaryChange = (value) => {
    setPrimaryFilter(value);
    setSecondaryFilter('all');
  };

  const filteredItems = useMemo(() => {
    let result = pricingItems;

    if (primaryFilter === 'category' && secondaryFilter !== 'all') {
      result = result.filter((i) => i.category === secondaryFilter);
    } else if (primaryFilter === 'margin') {
      result = result.filter((i) => calcMargin(i) < 30);
    } else if (primaryFilter === 'recentlyUpdated') {
      result = [...result].sort((a, b) => new Date(b.updated) - new Date(a.updated));
    }

    if (search.trim() !== '') {
      result = result.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    }

    return result;
  }, [pricingItems, primaryFilter, secondaryFilter, search]);

  const stats = useMemo(() => {
    const totalMargin = filteredItems.reduce((sum, item) => sum + calcMargin(item), 0);
    const avgMargin = filteredItems.length ? totalMargin / filteredItems.length : 0;
    return { total: filteredItems.length, avgMargin };
  }, [filteredItems]);

  const categoryMargins = useMemo(() => {
    const groups = {};
    pricingItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(calcMargin(item));
    });
    const averages = {};
    Object.keys(groups).forEach((cat) => {
      averages[cat] = groups[cat].reduce((sum, m) => sum + m, 0) / groups[cat].length;
    });
    return averages;
  }, [pricingItems]);

  const priceTiers = useMemo(() => {
    const tiers = { 'Premium (>40%)': 0, 'Standard (25-40%)': 0, 'Budget (<25%)': 0 };
    pricingItems.forEach((item) => {
      const margin = calcMargin(item);
      if (margin > 40) tiers['Premium (>40%)'] += item.selling;
      else if (margin >= 25) tiers['Standard (25-40%)'] += item.selling;
      else tiers['Budget (<25%)'] += item.selling;
    });
    return tiers;
  }, [pricingItems]);

  const priceTierLegendItems = Object.keys(priceTiers).map((label, i) => ({ name: label, color: tierColors[i] }));

  const marginByCategoryConfig = {
    type: 'bar',
    data: {
      labels: Object.keys(categoryMargins),
      datasets: [{ data: Object.values(categoryMargins).map((v) => v.toFixed(1)), backgroundColor: '#1f6b4d', borderRadius: 4 }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + '%' } } },
    },
  };

  const priceTierConfig = {
    type: 'doughnut',
    data: {
      labels: Object.keys(priceTiers),
      datasets: [{ data: Object.values(priceTiers), backgroundColor: tierColors }],
    },
    options: { maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } },
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Prices</h1>
        <div className="text-muted small">Manage component prices</div>
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
        searchPlaceholder="Search items..."
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4"><StatCard icon="fa-box-open" value={stats.total} label="Total Products" /></div>
        <div className="col-6 col-lg-4"><StatCard icon="fa-percentage" value={`${stats.avgMargin.toFixed(1)}%`} label="Avg Margin" /></div>
        <div className="col-6 col-lg-4"><StatCard icon="fa-rotate" value="12" label="Price Changes Today" /></div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Component Pricing</h6>
          <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('price')}>
            <i className="fa-solid fa-plus"></i> Add
          </button>
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
                const margin = calcMargin(item);
                const marginClass = margin < 30 ? 'text-warning' : 'text-success';
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td><span className="badge bg-brand-light text-brand-green">{item.category}</span></td>
                    <td>${(item.purchase ?? 0).toFixed(2)}</td>
                    <td>${(item.selling ?? 0).toFixed(2)}</td>
                    <td className={`fw-semibold ${marginClass}`}>{margin.toFixed(1)}%</td>
                    <td>{item.vendor}</td>
                    <td className="text-muted">{item.updated}</td>
                    <td>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('price', item)}></i>
                      <i
                        className="fa-solid fa-trash text-danger row-action-icon"
                        role="button"
                        onClick={() => window.confirm('متأكدة إنك عايزة تحذفي الصنف ده؟') && deletePricingItem(item.id)}
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
        <div className="col-lg-7">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Margin by Category</h6>
            <div style={{ height: 260 }}><ChartCanvas config={marginByCategoryConfig} /></div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Revenue by Price Tier</h6>
            <div style={{ height: 180 }}><ChartCanvas config={priceTierConfig} /></div>
            <Legend items={priceTierLegendItems} layout="row" />
          </div>
        </div>
      </div>
    </>
  );
}
