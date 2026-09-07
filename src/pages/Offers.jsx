import { useState, useMemo, useEffect } from 'react';
import { useOffers } from '../context/OffersContext';
import { useModal } from '../context/ModalContext';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';
import OfferProductsModal from '../components/OfferProductsModal';

const statusColors = { Active: 'success', Ended: 'secondary', Stopped: 'danger', Upcoming: 'primary' };
const typeLabels = { percentage: 'نسبة مئوية', package: 'سعر باقة' };

export default function Offers() {
  const { offers, deleteOffer, toggleStatus, fetchFiltered, fetchStats, exportCsv } = useOffers();
  const { openAdd, openEdit } = useModal();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [displayedOffers, setDisplayedOffers] = useState(null);
  const [stats, setStats] = useState(null);
  const [productsOffer, setProductsOffer] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, [offers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim() || statusFilter || typeFilter || sortBy) {
        fetchFiltered({
          searchTerm: search.trim() || undefined,
          status: statusFilter || undefined,
          offerType: typeFilter || undefined,
          sortBy: sortBy || undefined,
        }).then(setDisplayedOffers).catch(() => setDisplayedOffers([]));
      } else {
        setDisplayedOffers(null);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, typeFilter, sortBy]);

  const filteredOffers = displayedOffers ?? offers;

  const typeChartConfig = useMemo(() => {
    const dist = stats?.typeDistribution ?? [];
    return {
      type: 'doughnut',
      data: { labels: dist.map((d) => d.type), datasets: [{ data: dist.map((d) => d.count), backgroundColor: ['#1f6b4d', '#f0a93a', '#0d6efd'] }] },
      options: { maintainAspectRatio: false, cutout: '60%' },
    };
  }, [stats]);

  const requestsChartConfig = useMemo(() => {
    const top = stats?.topRequestedOffers ?? [];
    return {
      type: 'bar',
      data: { labels: top.map((o) => o.title), datasets: [{ data: top.map((o) => o.requestsCount), backgroundColor: '#1f6b4d', borderRadius: 4 }] },
      options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } },
    };
  }, [stats]);

  function handleDelete(id) {
    if (window.confirm('هل أنت متأكدة من حذف هذا العرض؟')) deleteOffer(id);
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Offers</h1>
        <div className="text-muted small">إدارة العروض الترويجية</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-bullseye" value={stats?.totalOffers ?? '-'} label="إجمالي العروض" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-circle-check" value={stats?.activeNow ?? '-'} label="نشط حاليًا" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-chart-simple" value={stats ? `${stats.successRate}%` : '-'} label="نسبة نجاح العروض" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-box" value={stats?.totalProductsInOffers ?? '-'} label="إجمالي المنتجات في العروض" /></div>
        <div className="col-6 col-lg-2-4">
          <StatCard icon="fa-trophy" value={stats?.mostRequestedOfferTitle ?? '-'} label={`العرض الأكثر طلبًا (${stats?.mostRequestedCount ?? 0} طلب)`} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">توزيع العروض حسب النوع</h6>
            <div style={{ height: 240 }}><ChartCanvas config={typeChartConfig} /></div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">أعلى العروض من حيث الطلبات</h6>
            <div style={{ height: 240 }}><ChartCanvas config={requestsChartConfig} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
              <input type="text" className="form-control ps-4" style={{ minWidth: 200 }} placeholder="ابحث في العروض..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">كل الحالات</option>
              <option value="Active">Active</option>
              <option value="Ended">Ended</option>
              <option value="Stopped">Stopped</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            <select className="form-select" style={{ width: 140 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">كل الأنواع</option>
              <option value="Percentage">نسبة مئوية</option>
              <option value="Bundle">سعر باقة</option>
            </select>
            <select className="form-select" style={{ width: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">الترتيب الافتراضي</option>
              <option value="PriceAsc">السعر تصاعدي</option>
              <option value="PriceDesc">السعر تنازلي</option>
              <option value="RequestsAsc">الطلبات تصاعدي</option>
              <option value="RequestsDesc">الطلبات تنازلي</option>
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('offer')}>
              <i className="fa-solid fa-plus"></i> عرض جديد
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => exportCsv(statusFilter || undefined)}>
              <i className="fa-solid fa-download"></i> Export CSV
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>العنوان</th><th>تاريخ البداية</th><th>تاريخ النهاية</th>
                <th>القيمة</th><th>السعر الإجمالي</th><th>عدد المنتجات</th>
                <th>عدد الطلبات</th><th>الحالة</th><th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="fw-semibold">{o.title}</div>
                    <div className="text-muted small">{typeLabels[o.type]}</div>
                  </td>
                  <td>{o.startDate?.slice(0, 10)}</td>
                  <td>{o.endDate?.slice(0, 10)}</td>
                  <td>{o.type === 'percentage' ? `${o.discountPercentage}%` : `$${o.bundlePrice}`}</td>
                  <td>${(o.totalOfferPrice ?? 0).toFixed(2)}</td>
                  <td>
                    {o.productsCount ?? 0}{' '}
                    <i className="fa-solid fa-box-open text-muted row-action-icon ms-1" role="button" title="إدارة منتجات العرض" onClick={() => setProductsOffer(o)}></i>
                  </td>
                  <td>{o.requestsCount ?? 0}</td>
                  <td><span className={`badge bg-${statusColors[o.status] ?? 'secondary'}-subtle text-${statusColors[o.status] ?? 'secondary'}`}>{o.status}</span></td>
                  <td>
                    <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('offer', o)}></i>
                    <i
                      className={`fa-solid fa-power-off me-3 row-action-icon ${o.isActive ? 'text-warning' : 'text-success'}`}
                      role="button"
                      title="تفعيل/إيقاف"
                      onClick={() => toggleStatus(o.id)}
                    ></i>
                    <i className="fa-solid fa-trash text-danger row-action-icon" role="button" onClick={() => handleDelete(o.id)}></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OfferProductsModal offer={productsOffer} onClose={() => setProductsOffer(null)} />
    </>
  );
}