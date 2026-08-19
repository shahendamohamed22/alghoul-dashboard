import { useState, useMemo } from 'react';
import { useOffers } from '../context/OffersContext';
import { useModal } from '../context/ModalContext';
import { getOfferStatus } from '../data/offers';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';

const typeLabels = { percentage: 'نسبة مئوية', package: 'سعر باقة' };
const statusColors = { 'نشط': 'success', 'منتهي': 'secondary', 'قادم': 'primary' };

export default function Offers() {
  const { offers, deleteOffer } = useOffers();
  const { openAdd, openEdit } = useModal();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // نضيف status محسوبة لكل عرض مرة واحدة، عشان الفلترة والعرض يستخدموها من غير ما يحسبوها كل مرة لوحدهم
  const offersWithStatus = useMemo(
    () => offers.map((o) => ({ ...o, status: getOfferStatus(o) })),
    [offers]
  );

  const filteredOffers = useMemo(() => {
    let result = offersWithStatus;

    if (statusFilter !== 'all') result = result.filter((o) => o.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter((o) => o.type === typeFilter);
    if (search.trim() !== '') {
      result = result.filter((o) => o.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (sortBy === 'requests') result = [...result].sort((a, b) => b.requestsCount - a.requestsCount);
    else if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    else if (sortBy === 'price') result = [...result].sort((a, b) => b.totalPrice - a.totalPrice);

    return result;
  }, [offersWithStatus, statusFilter, typeFilter, search, sortBy]);

  // إحصائيات الكروت الخمسة فوق، محسوبة من كل العروض (مش من النتيجة المفلترة، زي باقي الصفحات)
  const stats = useMemo(() => {
    const total = offersWithStatus.length;
    const active = offersWithStatus.filter((o) => o.status === 'نشط').length;
    const ended = offersWithStatus.filter((o) => o.status === 'منتهي');
    const successRate = ended.length ? 100 : 0; // نفس منطق الصورة: كل العروض المنتهية اتحسبت "ناجحة"
    const totalProducts = offersWithStatus.reduce((sum, o) => sum + (o.productsCount ?? 0), 0);
    const topOffer = [...offersWithStatus].sort((a, b) => b.requestsCount - a.requestsCount)[0];
    return { total, active, successRate, totalProducts, topOffer };
  }, [offersWithStatus]);

  // توزيع العروض حسب النوع (donut chart)
  const typeDistribution = useMemo(() => {
    const counts = { percentage: 0, package: 0 };
    offersWithStatus.forEach((o) => { counts[o.type] = (counts[o.type] || 0) + 1; });
    return counts;
  }, [offersWithStatus]);

  const typeChartConfig = {
    type: 'doughnut',
    data: {
      labels: ['نسبة مئوية', 'سعر باقة'],
      datasets: [{ data: [typeDistribution.percentage, typeDistribution.package], backgroundColor: ['#1f6b4d', '#f0a93a'] }],
    },
    options: { maintainAspectRatio: false, cutout: '60%' },
  };

  // أعلى 5 عروض من حيث عدد الطلبات (bar chart)
  const topByRequests = useMemo(
    () => [...offersWithStatus].sort((a, b) => b.requestsCount - a.requestsCount).slice(0, 5),
    [offersWithStatus]
  );

  const requestsChartConfig = {
    type: 'bar',
    data: {
      labels: topByRequests.map((o) => o.title),
      datasets: [{ data: topByRequests.map((o) => o.requestsCount), backgroundColor: '#1f6b4d', borderRadius: 4 }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
  };

  function handleDelete(id) {
    if (window.confirm('هل أنت متأكدة من حذف هذا العرض؟')) {
      deleteOffer(id);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Offers</h1>
        <div className="text-muted small">إدارة العروض الترويجية</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-bullseye" value={stats.total} label="إجمالي العروض" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-circle-check" value={stats.active} label="نشط حاليًا" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-chart-simple" value={`${stats.successRate}%`} label="نسبة نجاح العروض" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-box" value={stats.totalProducts} label="إجمالي المنتجات في العروض" /></div>
        <div className="col-6 col-lg-2-4">
          <StatCard icon="fa-trophy" value={stats.topOffer?.title ?? '-'} label={`العرض الأكثر طلبًا (${stats.topOffer?.requestsCount ?? 0} طلب)`} />
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
              <input
                type="text"
                className="form-control ps-4"
                style={{ minWidth: 200 }}
                placeholder="ابحث في العروض..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="نشط">نشط</option>
              <option value="منتهي">منتهي</option>
              <option value="قادم">قادم</option>
            </select>
            <select className="form-select" style={{ width: 140 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">كل الأنواع</option>
              <option value="percentage">نسبة مئوية</option>
              <option value="package">سعر باقة</option>
            </select>
            <select className="form-select" style={{ width: 160 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">الترتيب الافتراضي</option>
              <option value="requests">الأكثر طلبًا</option>
              <option value="newest">الأحدث</option>
              <option value="price">السعر</option>
            </select>
          </div>
          <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('offer')}>
            <i className="fa-solid fa-plus"></i> عرض جديد
          </button>
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
                  <td>{o.startDate}</td>
                  <td>{o.endDate}</td>
                  <td>{o.type === 'percentage' ? `${o.value}%` : `$${o.value}`}</td>
                  <td>${(o.totalPrice ?? 0).toFixed(2)}</td>
                  <td>{o.productsCount ?? 0}</td>
                  <td>{o.requestsCount ?? 0}</td>
                  <td><span className={`badge bg-${statusColors[o.status]}-subtle text-${statusColors[o.status]}`}>{o.status}</span></td>
                  <td>
                    <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('offer', o)}></i>
                    <i className="fa-solid fa-trash text-danger row-action-icon" role="button" onClick={() => handleDelete(o.id)}></i>
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