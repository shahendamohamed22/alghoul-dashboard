import { useState, useMemo , useEffect } from 'react';
import { useEmployees } from '../context/EmployeesContext';
import { useModal } from '../context/ModalContext';
import { weeklySchedule, weekDays } from '../data/employees';
import { useBranches } from '../context/BranchesContext';
import FilterBar from '../components/FilterBar';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';
import Legend from '../components/Legend';

const roleMap = { Manager: 0, Cashier: 1, Stocker: 2, Butcher: 3 };
const roleNames = Object.keys(roleMap);

const primaryOptions = [
  { value: 'all', label: 'All employees' },
  { value: 'branch', label: 'By Branch' },
  { value: 'role', label: 'By role' },
  { value: 'shift', label: 'On shift now' },
];

export default function Employees() {
  const { employees, deleteEmployee, fetchByBranch, fetchByRole, fetchOnShift, searchEmployees } = useEmployees();
    const { branches } = useBranches();
  const { openAdd, openEdit } = useModal();
  const [primaryFilter, setPrimaryFilter] = useState('all');
  const [secondaryFilter, setSecondaryFilter] = useState('all');
  const [search, setSearch] = useState('');
    const [filteredFromApi, setFilteredFromApi] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const secondaryOptions = useMemo(() => {
    if (primaryFilter === 'branch') return [...new Set(employees.map((e) => e.branch))];
    if (primaryFilter === 'role') return [...new Set(employees.map((e) => e.role))];
    return [];
  }, [employees, primaryFilter]);

  useEffect(() => {
    if (primaryFilter === 'shift') {
      fetchOnShift().then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else if (primaryFilter === 'branch' && secondaryFilter !== 'all') {
      const branch = branches.find((b) => b.name === secondaryFilter);
      if (branch) fetchByBranch(branch.id).then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
    } else if (primaryFilter === 'role' && secondaryFilter !== 'all') {
      const roleId = roleMap[secondaryFilter];
      fetchByRole(roleId).then(setFilteredFromApi).catch(() => setFilteredFromApi([]));
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
  
  const handlePrimaryChange = (value) => {
    setPrimaryFilter(value);
    setSecondaryFilter('all');
  };

   const filteredEmployees = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return filteredFromApi ?? employees;
  }, [employees, filteredFromApi, searchResults]);

  const stats = useMemo(() => ({
    total: filteredEmployees.length,
    onShift: filteredEmployees.filter((e) => e.status === 'Active').length,
  }), [filteredEmployees]);

  const scheduleConfig = useMemo(() => ({
    type: 'bar',
    data: {
      labels: weekDays,
      datasets: weeklySchedule.map((emp) => ({ label: emp.name, data: emp.hours, backgroundColor: emp.color })),
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: 'Hours' } },
      },
    },
  }), []);

  const scheduleLegendItems = weeklySchedule.map((e) => ({ name: e.name, color: e.color }));

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Employees</h1>
        <div className="text-muted small">Employee directory</div>
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
        searchPlaceholder="Search employees..."
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="fa-user-gear" value={stats.total} label="Total Employees" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-clock" value={stats.onShift} label="On Shift Now" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-calendar" value="2.4 years" label="Avg Tenure" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="fa-suitcase" value="7" label="Open Positions" /></div>
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
                <th>WORK END</th><th>STATUS</th><th>PHONE</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const statusClass = emp.status === 'Active' ? 'success' : 'warning';
                return (
                  <tr key={emp.id}>
                    <td>{emp.name} <span className="text-muted small">{emp.id}</span></td>
                    <td>{emp.branch}</td>
                    <td><i className="fa-solid fa-circle text-brand-green" style={{ fontSize: 6 }}></i> {emp.role}</td>
                    <td>{emp.start}</td>
                    <td>{emp.end}</td>
                    <td><span className={`badge bg-${statusClass}-subtle text-${statusClass}`}>{emp.status}</span></td>
                    <td>{emp.phone}</td>
                    <td>
                      <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('employee', emp)}></i>
                      <i
                        className="fa-solid fa-trash text-danger row-action-icon"
                        role="button"
                        onClick={() => window.confirm('متأكدة إنك عايزة تحذفي الموظف ده؟') && deleteEmployee(emp.id)}
                      ></i>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border rounded-4 p-3 mt-3">
        <h6 className="fw-bold mb-3">Weekly Schedule Overview</h6>
        <div style={{ height: 260 }}><ChartCanvas config={scheduleConfig} /></div>
        <Legend items={scheduleLegendItems} layout="row" />
      </div>
    </>
  );
}
