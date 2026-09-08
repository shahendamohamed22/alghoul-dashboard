import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useCategories } from '../context/CategoriesContext';
import { useBrands } from '../context/BrandsContext';
import { useModal } from '../context/ModalContext';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';

export default function Products() {
  const { products, toggleStatus, fetchFiltered, fetchDashboardStats, fetchCategoryChart, fetchPriceChart } = useProducts();
  const { flatCategories } = useCategories();
  const { brands } = useBrands();
  const { openAdd, openEdit } = useModal();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [discountFilter, setDiscountFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [stats, setStats] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [priceChartData, setPriceChartData] = useState([]);

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(() => setStats(null));
    fetchCategoryChart().then(setCategoryChartData).catch(() => setCategoryChartData([]));
    fetchPriceChart().then(setPriceChartData).catch(() => setPriceChartData([]));
  }, [products]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFiltered({
        searchTerm: search.trim() || undefined,
        categoryId: categoryFilter || undefined,
        brandId: brandFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
        hasDiscount: discountFilter === '' ? undefined : discountFilter === 'true',
        sortBy: sortBy || undefined,
      }).then((res) => {
        // We just re-set the local list ourselves here instead of using
        // the context's own auto-fetch, since this page drives its own filters
        setDisplayed(res);
      });
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search, categoryFilter, brandFilter, statusFilter, discountFilter, sortBy]);

  const [displayed, setDisplayed] = useState(null);
  const filteredProducts = displayed ?? products;

  const categoryChartConfig = useMemo(() => ({
    type: 'bar',
    data: { labels: categoryChartData.map((d) => d.label), datasets: [{ data: categoryChartData.map((d) => d.value), backgroundColor: '#1f6b4d', borderRadius: 4 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
  }), [categoryChartData]);

  const priceChartConfig = useMemo(() => ({
    type: 'bar',
    data: { labels: priceChartData.map((d) => d.label), datasets: [{ data: priceChartData.map((d) => d.value), backgroundColor: '#f0a93a', borderRadius: 4 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
  }), [priceChartData]);

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Products</h1>
        <div className="text-muted small">Product catalog</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-box" value={stats?.totalProducts ?? '-'} label="إجمالي المنتجات" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-folder" value={stats?.categoriesCount ?? '-'} label="التصنيفات" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-tags" value={stats?.brandsCount ?? '-'} label="البراندات" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-coins" value={stats ? `$${stats.averagePrice.toFixed(2)}` : '-'} label="متوسط سعر البيع" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-star" value={stats?.averageRating?.toFixed(1) ?? '-'} label="متوسط التقييم (من 5)" /></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">توزيع المنتجات حسب التصنيف</h6>
            <div style={{ height: 260 }}><ChartCanvas config={categoryChartConfig} /></div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">توزيع المنتجات حسب السعر</h6>
            <div style={{ height: 260 }}><ChartCanvas config={priceChartConfig} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
              <input type="text" className="form-control ps-4" style={{ minWidth: 180 }} placeholder="ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">كل التصنيفات</option>
              {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="">كل البراندات</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">كل المنتجات</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
            <select className="form-select" style={{ width: 130 }} value={discountFilter} onChange={(e) => setDiscountFilter(e.target.value)}>
              <option value="">خصم؟</option>
              <option value="true">عليه خصم</option>
              <option value="false">من غير خصم</option>
            </select>
            <select className="form-select" style={{ width: 150 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">الترتيب الافتراضي</option>
              <option value="PriceAsc">السعر تصاعدي</option>
              <option value="PriceDesc">السعر تنازلي</option>
              <option value="Newest">الأحدث</option>
              <option value="Oldest">الأقدم</option>
              <option value="TopSales">الأكثر مبيعًا</option>
            </select>
          </div>
          <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('product')}>
            <i className="fa-solid fa-plus"></i> إضافة منتج
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>اسم المنتج</th><th>التصنيف</th><th>البراند</th><th>سعر البيع</th>
                <th>الخصم</th><th>التقييم</th><th>الحالة</th><th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.brand || '-'}</td>
                  <td>
                    ${p.priceAfter?.toFixed(2)}
                    {p.discount > 0 && <span className="text-muted small text-decoration-line-through ms-1">${p.priceBefore?.toFixed(2)}</span>}
                  </td>
                  <td>{p.discount > 0 ? <span className="text-danger">-{p.discount}%</span> : '-'}</td>
                  <td>{p.rating ? <><i className="fa-solid fa-star text-warning"></i> {p.rating} ({p.reviewsCount})</> : '-'}</td>
                  <td>
                    <span className={`badge bg-${p.isActive ? 'success' : 'danger'}-subtle text-${p.isActive ? 'success' : 'danger'}`}>
                      {p.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td>
                    <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('product', p)}></i>
                    <i
                      className={`fa-solid fa-power-off row-action-icon ${p.isActive ? 'text-warning' : 'text-success'}`}
                      role="button"
                      onClick={() => toggleStatus(p.id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}