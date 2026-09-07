import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranches } from '../context/BranchesContext';
import StatCard from '../components/StatCard';

export default function BranchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBranchById, fetchBranchStats, toggleStatus } = useBranches();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function loadData() {
    setLoading(true);
    return Promise.all([fetchBranchById(id), fetchBranchStats(id)])
      .then(([p, s]) => { setProfile(p); setStats(s); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [id]);

  if (loading) return <div className="text-center text-muted p-5">جاري التحميل...</div>;
  if (error || !profile) return <div className="text-center text-danger p-5">تعذر تحميل بيانات الفرع</div>;

  return (
    <>
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/branches')}>
        <i className="fa-solid fa-arrow-right"></i> رجوع لكل الفروع
      </button>

      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">{profile.name}</h1>
          <div className="text-muted small">{profile.address} — {profile.city}</div>
        </div>
        <button
          className={`btn btn-sm ${profile.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
          onClick={async () => { await toggleStatus(id); loadData(); }}
        >
          {profile.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="fa-dollar-sign" value={`$${(stats?.revenue ?? 0).toLocaleString()}`} label="This Month Revenue" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-bag-shopping" value={stats?.orders ?? 0} label="Orders" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-users" value={stats?.customers ?? 0} label="Customers" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-bullseye" value={`${stats?.target ?? 0}%`} label="Target Achieved" /></div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <h6 className="fw-bold mb-3">Branch Info</h6>
        <div className="row g-3 small">
          <div className="col-md-4"><span className="text-muted">Phone: </span>{profile.phoneNumber}</div>
          <div className="col-md-4"><span className="text-muted">Opening: </span>{profile.openingTime}</div>
          <div className="col-md-4"><span className="text-muted">Closing: </span>{profile.closingTime}</div>
          <div className="col-md-4"><span className="text-muted">Revenue Target: </span>${(profile.revenueTarget ?? 0).toLocaleString()}</div>
          <div className="col-md-4"><span className="text-muted">Status: </span>{stats?.status ?? (profile.isActive ? 'Open' : 'Closed')}</div>
          <div className="col-md-4"><span className="text-muted">Last Month Revenue: </span>${(stats?.lastMonthRevenue ?? 0).toLocaleString()}</div>
        </div>
      </div>
    </>
  );
}