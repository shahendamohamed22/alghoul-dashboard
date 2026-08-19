import { useState, useMemo } from 'react';
import { useItems } from '../context/ItemsContext';
import { useModal } from '../context/ModalContext';
import { categoryColors } from '../data/items';
import FilterBar from '../components/FilterBar';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';
import Legend from '../components/Legend';

const primaryOptions = [
  { value: 'all', label: 'All Items' },
  { value: 'branch', label: 'By Branch' },
  { value: 'category', label: 'By Category' },
  { value: 'vendor', label: 'By Vendor' },
  { value: 'low-stock', label: 'Low Stock' },
];

const stockColorMap = { Produce: '#16342c', Dairy: '#1f6b4d', Meat: '#3d9970', Bakery: '#7fc79e', Beverages: '#b8e0c8' };

export default function Store() {
  const { items, deleteItem } = useItems();
  const { openEdit } = useModal();
  const [primaryFilter, setPrimaryFilter] = useState('all');
  const [secondaryFilter, setSecondaryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // خيارات الفلتر الفرعي بتتغير حسب primaryFilter المختار - نفس فكرة
  // renderSecondaryButtons() القديمة، بس هنا هي مجرد حساب (derived value)
  // مش رسم يدوي لعناصر HTML
  const secondaryOptions = useMemo(() => {
    if (primaryFilter === 'branch') return [...new Set(items.map((i) => i.branch))];
    if (primaryFilter === 'category') return [...new Set(items.map((i) => i.category))];
    return [];
  }, [items, primaryFilter]);

  const handlePrimaryChange = (value) => {
    setPrimaryFilter(value);
    setSecondaryFilter('all'); // كل مرة نغير الفلتر الأساسي، نرجع الفرعي لـ "الكل"
  };

  const filteredItems = useMemo(() => {
    let result = items;

    if (primaryFilter === 'low-stock') {
      result = result.filter((i) => i.status === 'Low Stock');
    } else if (primaryFilter === 'branch' && secondaryFilter !== 'all') {
      result = result.filter((i) => i.branch === secondaryFilter);
    } else if (primaryFilter === 'category' && secondaryFilter !== 'all') {
      result = result.filter((i) => i.category === secondaryFilter);
    }

    if (search.trim() !== '') {
      result = result.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    }

    return result;
  }, [items, primaryFilter, secondaryFilter, search]);

  // الإحصائيات (stats cards) بتتحسب من نفس filteredItems - زي renderStats(result)
  const stats = useMemo(() => ({
    total: filteredItems.length,
    categories: new Set(filteredItems.map((i) => i.category)).size,
    branches: new Set(filteredItems.map((i) => i.branch)).size,
    lowStock: filteredItems.filter((i) => i.status === 'Low Stock').length,
  }), [filteredItems]);

  // بيانات الشارتات بتتحسب مرة واحدة من كل الـ items (زي الأصل، مش من النتيجة المفلترة)
  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return counts;
  }, [items]);

  const stockTotals = useMemo(() => {
    const totals = {};
    items.forEach((i) => { totals[i.category] = (totals[i.category] || 0) + i.quantity; });
    return totals;
  }, [items]);

  const stockLabels = Object.keys(stockTotals);
  const stockLegendItems = stockLabels.map((label) => ({ name: label, color: stockColorMap[label] || '#ccc' }));

  const itemsByCategoryConfig = {
    type: 'bar',
    data: {
      labels: Object.keys(categoryCounts),
      datasets: [{ data: Object.values(categoryCounts), backgroundColor: '#1f6b4d', borderRadius: 4 }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
  };

  const stockValueConfig = {
    type: 'doughnut',
    data: {
      labels: stockLabels,
      datasets: [{ data: Object.values(stockTotals), backgroundColor: stockLabels.map((l) => stockColorMap[l] || '#ccc') }],
    },
    options: { maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } },
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Store</h1>
        <div className="text-muted small">Inventory management</div>
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
        <div className="col-6 col-lg-3"><StatCard icon="fa-box" value={stats.total} label="TOTAL ITEMS" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-table-cells" value={stats.categories} label="CATEGORIES" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-truck" value={stats.branches} label="VENDORS" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-triangle-exclamation" value={stats.lowStock} label="LOW STOCK ITEMS" /></div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Inventory</h6>
          <button className="btn btn-outline-secondary btn-sm"><i className="fa-solid fa-download"></i> Export CSV</button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>ITEM NAME</th><th>SKU</th><th>CATEGORY</th><th>BRANCH</th>
                <th>QUANTITY</th><th>STATUS</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const statusClass = item.status === 'In Stock' ? 'success' : 'danger';
                const catColor = categoryColors[item.category] || 'secondary';
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="text-muted">{item.sku}</td>
                    <td><span className={`badge bg-${catColor}-subtle text-${catColor}`}>{item.category}</span></td>
                    <td>{item.branch}</td>
                    <td>{item.quantity}</td>
                    <td><span className={`badge bg-${statusClass}-subtle text-${statusClass}`}>{item.status}</span></td>
                    <td>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('item', item)}></i>
                      <i
                        className="fa-solid fa-trash text-danger row-action-icon"
                        role="button"
                        onClick={() => window.confirm('متأكدة إنك عايزة تحذفي الصنف ده؟') && deleteItem(item.id)}
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
            <h6 className="fw-bold mb-3">Items by Category</h6>
            <div style={{ height: 260 }}><ChartCanvas config={itemsByCategoryConfig} /></div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Stock Value Distribution</h6>
            <div style={{ height: 180 }}><ChartCanvas config={stockValueConfig} /></div>
            <Legend items={stockLegendItems} layout="row" />
          </div>
        </div>
      </div>
    </>
  );
}
