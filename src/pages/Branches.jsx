import { useState, useMemo , useEffect } from 'react';
import { useBranches } from '../context/BranchesContext';
import { useModal } from '../context/ModalContext';

function BranchCard({ b, onEdit, onDelete }) {
  const growth = b.growth ?? 0;
  const growthIcon = growth >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
  const growthClass = growth >= 0 ? 'text-success' : 'text-danger';
  const growthSign = growth >= 0 ? '+' : '';

  return (
    <div className="col-md-6 col-lg-4">
      <div className="bg-white border rounded-4 p-3 h-100">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-brand-dark text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
              <i className="fa-solid fa-store"></i>
            </div>
            <div>
              <div className="fw-semibold">{b.name}</div>
              <div className="text-muted small">{b.address}</div>
            </div>
          </div>
          {/* أزرار التعديل والحذف - بتظهر جنب كل كارت */}
          <div className="d-flex gap-3">
            <i className="fa-solid fa-pen text-muted row-action-icon" role="button" onClick={() => onEdit(b)}></i>
            <i className="fa-solid fa-trash text-danger row-action-icon" role="button" onClick={() => onDelete(b.id)}></i>
          </div>
        </div>

        <div className="fs-4 fw-bold mb-1">${(b.revenue ?? 0).toLocaleString()}</div>
        <div className="small mb-3">
          <span className={growthClass}><i className={`fa-solid ${growthIcon}`}></i> {growthSign}{growth}%</span>
          <span className="text-muted"> vs last month</span>
        </div>

        <div className="d-flex justify-content-between align-items-center small mb-2">
          <span className="text-muted"><i className="fa-solid fa-users"></i> {b.staff ?? 0} staff</span>
          <span className="text-success"><i className="fa-solid fa-circle" style={{ fontSize: 8 }}></i> {b.status ?? 'Open'}</span>
        </div>

        <div className="text-muted small mb-1">{b.target ?? 0}% of target</div>
        <div className="progress progress-target">
          <div className="progress-bar bg-brand-green" style={{ width: `${b.target ?? 0}%` }}></div>
        </div>
      </div>
    </div>
  );
}

export default function Branches() {
  const { branches, deleteBranch, fetchTopPerforming, fetchNeedsAttention , searchBranches} = useBranches();
  const [searchResults, setSearchResults] = useState(null);
const [filteredFromApi, setFilteredFromApi] = useState(null); // null = مفيش فلتر API شغال، استخدمي branches العادية
  const { openEdit } = useModal();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
  if (filter === 'top') {
    fetchTopPerforming().then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
  } else if (filter === 'attention') {
    fetchNeedsAttention().then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
  } else {
    setFilteredFromApi(null);
  }
}, [filter]);

useEffect(() => {
  if (search.trim() === '') {
    setSearchResults(null);
    return;
  }

  const timeoutId = setTimeout(() => {
    searchBranches(search).then(setSearchResults).catch(() => setSearchResults([]));
  }, 400);

  return () => clearTimeout(timeoutId); // ده الـ cleanup - بيلغي المؤقت لو كتبتي حرف تاني قبل ما الوقت يخلص
}, [search]);

 const filteredBranches = useMemo(() => {
  // البحث له الأولوية: لو فيه نتيجة بحث، اعرضيها واتجاهلي فلتر top/attention
  if (searchResults !== null) {
    return [...searchResults].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
  }
  let result = filteredFromApi ?? branches;
  return [...result].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
}, [branches, filteredFromApi, searchResults]);

  function handleEdit(branch) {
    openEdit('branch', branch);
  }

  function handleDelete(id) {
    if (window.confirm('متأكدة إنك عايزة تحذفي الفرع ده؟')) {
      deleteBranch(id);
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Branches</h1>
        <div className="text-muted small">{branches.length} branches overview</div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex gap-2">
          <button className={`filter-btn btn btn-success${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All Branches</button>
          <button className={`filter-btn btn btn-success${filter === 'top' ? ' active' : ''}`} onClick={() => setFilter('top')}>Top Performers</button>
          <button className={`filter-btn btn btn-success${filter === 'attention' ? ' active' : ''}`} onClick={() => setFilter('attention')}>Needs Attention</button>
        </div>

        <div className="position-relative">
          <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
          <input
            type="text"
            className="form-control ps-4"
            style={{ minWidth: 220 }}
            placeholder="Search branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-3">
        {filteredBranches.map((b) => (
          <BranchCard key={b.id} b={b} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      <div className="bg-white border rounded-4 p-3 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Branch Performance Details</h6>
          <span className="text-muted small">Showing 1-{filteredBranches.length} of {branches.length}</span>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>BRANCH</th>
                <th>REVENUE</th>
                <th>ORDERS</th>
                <th>STAFF</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((b) => {
                const statusClass = (b.status ?? 'Open') === 'Open' ? 'success' : 'secondary';
                return (
                  <tr key={b.id}>
                    <td>
                      <div className="fw-semibold">{b.name}</div>
                      <div className="text-muted small">{b.address}</div>
                    </td>
                    <td>${(b.revenue ?? 0).toLocaleString()}</td>
                    <td>{b.orders ?? '-'}</td>
                    <td>{b.staff ?? 0}</td>
                    <td><span className={`badge bg-${statusClass}-subtle text-${statusClass}`}>{b.status ?? 'Open'}</span></td>
                    <td>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => handleEdit(b)}></i>
                      <i className="fa-solid fa-trash text-danger row-action-icon" role="button" onClick={() => handleDelete(b.id)}></i>
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
