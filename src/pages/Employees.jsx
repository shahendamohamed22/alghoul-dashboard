import { useState, useMemo, useEffect } from 'react';
import { useEmployees } from '../context/EmployeesContext';
import { useBranches } from '../context/BranchesContext';
import { useModal } from '../context/ModalContext';
import StatCard from '../components/StatCard';

const roleMap = { Manager: 0, Cashier: 1, Stocker: 2, Cleaner: 3 };
const roleNames = Object.keys(roleMap);

const primaryOptions = [
  { value: 'all', label: 'All employees' },
  { value: 'branch', label: 'By Branch' },
  { value: 'role', label: 'By role' },
  { value: 'shift', label: 'On shift now' },
];

export default function Employees() {
  const { employees, toggleStatus, fetchByBranch, fetchByRole, fetchOnShift, searchEmployees, fetchStats } = useEmployees();
  const { branches } = useBranches();
  const { openAdd, openEdit } = useModal();

  const [primaryFilter, setPrimaryFilter] = useState('all');
  const [secondaryFilter, setSecondaryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [filteredFromApi, setFilteredFromApi] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, [employees]);

  const secondaryOptions = useMemo(() => {
    if (primaryFilter === 'branch') return branches.map((b) => b.name);
    if (primaryFilter === 'role') return roleNames;
    return [];
  }, [branches, primaryFilter]);

  const handlePrimaryChange = (value) => {
    setPrimaryFilter(value);
    setSecondaryFilter('all');
  };

  useEffect(() => {
    if (primaryFilter === 'shift') {
      fetchOnShift().then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else if (primaryFilter === 'branch' && secondaryFilter !== 'all') {
      const branch = branches.find((b) => b.name === secondaryFilter);
      if (branch) fetchByBranch(branch.id).then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else if (primaryFilter === 'role' && secondaryFilter !== 'all') {
      fetchByRole(roleMap[secondaryFilter]).then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else {
      setFilteredFromApi(null);
    }
  }, [primaryFilter, secondaryFilter, branches]);

  useEffect(() => {
    if (search.trim() === '') {
      setSearchResults(null);
      return;
    }
    const timeoutId = setTimeout(() => {
      searchEmployees(search).then(setSearchResults).catch(() => setSearchResults([]));
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const filteredEmployees = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return filteredFromApi ?? employees;
  }, [employees, filteredFromApi, searchResults]);

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Employees</h1>
        <div className="text-muted small">Employee directory</div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex gap-2 mb-2 flex-wrap">
            {primaryOptions.map((opt) => (
              <button
                key={opt.value}
                className={`filter-btn btn btn-success${primaryFilter === opt.value ? ' active' : ''}`}
                onClick={() => handlePrimaryChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {secondaryOptions.length > 0 && (
            <div className="d-flex gap-2 flex-wrap">
              <button className={`filter-btn-sub${secondaryFilter === 'all' ? ' active' : ''}`} onClick={() => setSecondaryFilter('all')}>All</button>
              {secondaryOptions.map((opt) => (
                <button key={opt} className={`filter-btn-sub${secondaryFilter === opt ? ' active' : ''}`} onClick={() => setSecondaryFilter(opt)}>{opt}</button>
              ))}
            </div>
          )}
        </div>
        <div className="position-relative">
          <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
          <input type="text" className="form-control ps-4" style={{ minWidth: 220 }} placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4"><StatCard icon="fa-user-gear" value={stats?.totalEmployees ?? '-'} label="Total Employees" /></div>
        <div className="col-6 col-lg-4"><StatCard icon="fa-clock" value={stats?.onShiftNow ?? '-'} label="On Shift Now" /></div>
        <div className="col-6 col-lg-4"><StatCard icon="fa-calendar" value={stats ? `${stats.avgTenureYears} years` : '-'} label="Avg Tenure" /></div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Employee Directory</h6>
          <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('employee')}>
            <i className="fa-solid fa-user-plus"></i> Add Employee
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>EMPLOYEE</th><th>BRANCH</th><th>ROLE</th><th>WORK START</th>
                <th>WORK END</th><th>STATUS</th><th>ON SHIFT</th><th>PHONE</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const statusClass = emp.status === 'Active' ? 'success' : emp.status === 'OnLeave' ? 'warning' : 'secondary';
                return (
                  <tr key={emp.id}>
                    <td>{emp.name} <span className="text-muted small">{emp.code}</span></td>
                    <td>{emp.branch}</td>
                    <td><i className="fa-solid fa-circle text-brand-green" style={{ fontSize: 6 }}></i> {emp.role}</td>
                    <td>{emp.start}</td>
                    <td>{emp.end}</td>
                    <td><span className={`badge bg-${statusClass}-subtle text-${statusClass}`}>{emp.status}</span></td>
                    <td>{emp.isOnShift ? <span className="text-success"><i className="fa-solid fa-circle" style={{ fontSize: 6 }}></i> Now</span> : '-'}</td>
                    <td>{emp.phone}</td>
                    <td>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('employee', emp)}></i>
                      <i
                        className={`fa-solid fa-power-off row-action-icon ${emp.isActive ? 'text-warning' : 'text-success'}`}
                        role="button"
                        title={emp.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleStatus(emp.id)}
                      ></i>
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