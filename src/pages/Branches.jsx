import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranches } from '../context/BranchesContext';
import { useModal } from '../context/ModalContext';

function BranchCard({ b, onEdit, onToggle, onView }) {
  const growth = b.growth ?? 0;
  const growthIcon = growth >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
  const growthClass = growth >= 0 ? 'text-success' : 'text-danger';
  const growthSign = growth >= 0 ? '+' : '';

  return (
    <div className="col-md-6 col-lg-4">
      <div className="bg-white border rounded-4 p-3 h-100">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2" role="button" onClick={() => onView(b.id)}>
            <div className="bg-brand-dark text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
              <i className="fa-solid fa-store"></i>
            </div>
            <div>
              <div className="fw-semibold">{b.name}</div>
              <div className="text-muted small">{b.address}</div>
            </div>
          </div>
          <div className="d-flex gap-3">
            <i className="fa-solid fa-pen text-muted row-action-icon" role="button" onClick={() => onEdit(b)}></i>
            <i className="fa-solid fa-power-off text-warning row-action-icon" role="button" onClick={() => onToggle(b.id)}></i>
          </div>
        </div>

        <div className="fs-4 fw-bold mb-1">${(b.revenue ?? 0).toLocaleString()}</div>
        <div className="small mb-3">
          <span className={growthClass}><i className={`fa-solid ${growthIcon}`}></i> {growthSign}{growth}%</span>
          <span className="text-muted"> vs last month</span>
        </div>

        <div className="d-flex justify-content-between align-items-center small mb-2">
          <span className="text-muted"><i className="fa-solid fa-users"></i> {b.customers ?? 0} customers</span>
          <span className={b.isActive ? 'text-success' : 'text-secondary'}>
            <i className="fa-solid fa-circle" style={{ fontSize: 8 }}></i> {b.status}
          </span>
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
  const { branches, toggleStatus, fetchFiltered, fetchTopPerforming, fetchNeedsAttention } = useBranches();
  const { openEdit } = useModal();
  const navigate = useNavigate();

  const [primaryFilter, setPrimaryFilter] = useState('all');
  const [isOpenFilter, setIsOpenFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [displayedBranches, setDisplayedBranches] = useState(null); // null = fall back to default `branches`

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (primaryFilter === 'top') {
        fetchTopPerforming().then(setDisplayedBranches).catch(() => setDisplayedBranches([]));
      } else if (primaryFilter === 'attention') {
        fetchNeedsAttention().then(setDisplayedBranches).catch(() => setDisplayedBranches([]));
      } else if (search.trim() !== '' || isOpenFilter !== 'all' || sortBy !== '') {
        fetchFiltered({
          search: search.trim() || undefined,
          isOpen: isOpenFilter === 'all' ? undefined : isOpenFilter === 'true',
          sortBy: sortBy || undefined,
          sortDir: sortBy ? sortDir : undefined,
        }).then(setDisplayedBranches).catch(() => setDisplayedBranches([]));
      } else {
        setDisplayedBranches(null);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [primaryFilter, isOpenFilter, sortBy, sortDir, search]);

  const filteredBranches = useMemo(() => {
    if (displayedBranches !== null) return displayedBranches;
    return [...branches].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));
  }, [branches, displayedBranches]);

  function handleEdit(branch) {
    openEdit('branch', branch);
  }

  function handleToggle(id) {
    toggleStatus(id);
  }

  function handleView(id) {
    navigate(`/branches/${id}`);
  }

  const otherFiltersDisabled = primaryFilter !== 'all';

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Branches</h1>
        <div className="text-muted small">{branches.length} branches overview</div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <button className={`filter-btn btn btn-success${primaryFilter === 'all' ? ' active' : ''}`} onClick={() => setPrimaryFilter('all')}>All Branches</button>
          <button className={`filter-btn btn btn-success${primaryFilter === 'top' ? ' active' : ''}`} onClick={() => setPrimaryFilter('top')}>Top Performers</button>
          <button className={`filter-btn btn btn-success${primaryFilter === 'attention' ? ' active' : ''}`} onClick={() => setPrimaryFilter('attention')}>Needs Attention</button>

          <select className="form-select form-select-sm" style={{ width: 120 }} value={isOpenFilter} disabled={otherFiltersDisabled} onChange={(e) => setIsOpenFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="true">Open</option>
            <option value="false">Closed</option>
          </select>

          <select className="form-select form-select-sm" style={{ width: 140 }} value={sortBy} disabled={otherFiltersDisabled} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Default Order</option>
            <option value="revenue">Sort: Revenue</option>
            <option value="orders">Sort: Orders</option>
          </select>

          {sortBy && (
            <select className="form-select form-select-sm" style={{ width: 110 }} value={sortDir} disabled={otherFiltersDisabled} onChange={(e) => setSortDir(e.target.value)}>
              <option value="desc">High → Low</option>
              <option value="asc">Low → High</option>
            </select>
          )}
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
            disabled={otherFiltersDisabled}
          />
        </div>
      </div>

      <div className="row g-3">
        {filteredBranches.map((b) => (
          <BranchCard key={b.id} b={b} onEdit={handleEdit} onToggle={handleToggle} onView={handleView} />
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
                <th>BRANCH</th><th>REVENUE</th><th>ORDERS</th><th>CUSTOMERS</th><th>STATUS</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((b) => {
                const statusClass = b.status === 'Open' ? 'success' : 'secondary';
                return (
                  <tr key={b.id}>
                    <td>
                      <div className="fw-semibold">{b.name}</div>
                      <div className="text-muted small">{b.address}</div>
                    </td>
                    <td>${(b.revenue ?? 0).toLocaleString()}</td>
                    <td>{b.orders ?? 0}</td>
                    <td>{b.customers ?? 0}</td>
                    <td><span className={`badge bg-${statusClass}-subtle text-${statusClass}`}>{b.status}</span></td>
                    <td>
                      <i className="fa-regular fa-eye text-muted me-3 row-action-icon" role="button" onClick={() => handleView(b.id)}></i>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => handleEdit(b)}></i>
                      <i className="fa-solid fa-power-off text-warning row-action-icon" role="button" onClick={() => handleToggle(b.id)}></i>
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