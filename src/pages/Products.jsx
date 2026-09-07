import { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useModal } from '../context/ModalContext';
import { productCategories, productBrands, productCategoryColors, getFinalPrice } from '../data/products';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';

export default function Products() {
  const { products, deleteProduct } = useProducts();
  const { openAdd, openEdit } = useModal();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = useMemo(() => {
    let result = products;
    if (categoryFilter !== 'all') result = result.filter((p) => p.category === categoryFilter);
    if (brandFilter !== 'all') result = result.filter((p) => p.brand === brandFilter);
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    if (search.trim() !== '') result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    if (sortBy === 'price') result = [...result].sort((a, b) => b.sellingPrice - a.sellingPrice);
    else if (sortBy === 'rating') result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortBy === 'discount') result = [...result].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));

    return result;
  }, [products, categoryFilter, brandFilter, statusFilter, search, sortBy]);

  const stats = useMemo(() => {
    const total = products.length;
    const categoriesCount = new Set(products.map((p) => p.category)).size;
    const brandsCount = new Set(products.map((p) => p.brand).filter(Boolean)).size;
    const avgPrice = total ? products.reduce((sum, p) => sum + p.sellingPrice, 0) / total : 0;
    const rated = products.filter((p) => p.rating);
    const avgRating = rated.length ? rated.reduce((sum, p) => sum + p.rating, 0) / rated.length : 0;
    return { total, categoriesCount, brandsCount, avgPrice, avgRating };
  }, [products]);

  const categoryChartConfig = useMemo(() => {
    const counts = {};
    productCategories.forEach((c) => { counts[c] = 0; });
    products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return {
      type: 'bar',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#1f6b4d'],
          borderRadius: 4,
        }],
      },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
    };
  }, [products]);

  const priceRangeChartConfig = useMemo(() => {
    const ranges = { '0 - 5 $': 0, '5 - 10 $': 0, '10 - 20 $': 0, '20+ $': 0 };
    products.forEach((p) => {
      if (p.sellingPrice <= 5) ranges['0 - 5 $']++;
      else if (p.sellingPrice <= 10) ranges['5 - 10 $']++;
      else if (p.sellingPrice <= 20) ranges['10 - 20 $']++;
      else ranges['20+ $']++;
    });
    return {
      type: 'bar',
      data: { labels: Object.keys(ranges), datasets: [{ data: Object.values(ranges), backgroundColor: '#1f6b4d', borderRadius: 4 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
    };
  }, [products]);

  function handleDelete(id) {
    if (window.confirm('هل أنت متأكدة من حذف هذا المنتج؟')) {
      deleteProduct(id);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Products</h1>
        <div className="text-muted small">Product catalog</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-box" value={stats.total.toLocaleString()} label="إجمالي المنتجات" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-folder" value={stats.categoriesCount} label="التصنيفات" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-tags" value={stats.brandsCount} label="البراندات" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-coins" value={`$${stats.avgPrice.toFixed(2)}`} label="متوسط سعر البيع" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-star" value={stats.avgRating.toFixed(1)} label="متوسط التقييم (من 5)" /></div>
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
            <div style={{ height: 260 }}><ChartCanvas config={priceRangeChartConfig} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
              <input
                type="text"
                className="form-control ps-4"
                style={{ minWidth: 180 }}
                placeholder="ابحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 140 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">كل التصنيفات</option>
              {productCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="all">كل البراندات</option>
              {productBrands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className="form-select" style={{ width: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">كل المنتجات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
            <select className="form-select" style={{ width: 150 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">الترتيب الافتراضي</option>
              <option value="price">السعر</option>
              <option value="rating">التقييم</option>
              <option value="discount">الخصم</option>
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('product')}>
              <i className="fa-solid fa-plus"></i> إضافة منتج
            </button>
            <button className="btn btn-outline-secondary btn-sm"><i className="fa-solid fa-download"></i> Export CSV</button>
          </div>
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
              {filteredProducts.map((p) => {
                const catColor = productCategoryColors[p.category] || 'secondary';
                const isActive = p.status === 'active';
                return (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.name}</td>
                    <td><span className={`badge bg-${catColor}-subtle text-${catColor}`}>{p.category}</span></td>
                    <td>{p.brand || '-'}</td>
                    <td>
                      ${p.sellingPrice.toFixed(2)}
                      {p.discount > 0 && <span className="text-muted small ms-1">→ ${getFinalPrice(p).toFixed(2)}</span>}
                    </td>
                    <td>{p.discount > 0 ? <span className="text-danger">-{p.discount}%</span> : '-'}</td>
                    <td>{p.rating ? <><i className="fa-solid fa-star text-warning"></i> {p.rating}</> : '-'}</td>
                    <td>
                      <span className={`badge bg-${isActive ? 'success' : 'danger'}-subtle text-${isActive ? 'success' : 'danger'}`}>
                        <i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i> {isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('product', p)}></i>
                      <i className="fa-solid fa-trash text-danger row-action-icon" role="button" onClick={() => handleDelete(p.id)}></i>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}