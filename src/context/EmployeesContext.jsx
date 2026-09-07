import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

export const roleMap = { Manager: 0, Cashier: 1, Stocker: 2, Cleaner: 3 };
export const statusMap = { Active: 0, OnLeave: 1, Inactive: 2 };

function mapEmployee(e) {
  return {
    id: e.id,
    code: e.employeeCode,
    name: e.fullName,
    email: e.email,
    phone: e.phoneNumber,
    role: e.role,
    branch: e.branchName,
    start: e.workStart?.slice(0, 5),
    end: e.workEnd?.slice(0, 5),
    status: e.status,
    isOnShift: e.isOnShift,
    tenureYears: e.tenureYears,
    isActive: e.isActive,
  };
}

const EmployeesContext = createContext(null);

export function EmployeesProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refreshEmployees() {
    return apiClient.get('/api/employee').then((res) => setEmployees(res.data.map(mapEmployee)));
  }

  useEffect(() => {
    refreshEmployees()
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  async function fetchByBranch(branchId) {
    const res = await apiClient.get(`/api/employee/branch/${branchId}`);
    return res.data.map(mapEmployee);
  }

  async function fetchByRole(roleId) {
    const res = await apiClient.get(`/api/employee/role/${roleId}`);
    return res.data.map(mapEmployee);
  }

  async function fetchOnShift() {
    const res = await apiClient.get('/api/employee/on-shift');
    return res.data.map(mapEmployee);
  }

  async function searchEmployees(keyword) {
    const res = await apiClient.get('/api/employee/search', { params: { keyword } });
    return res.data.map(mapEmployee);
  }

  async function fetchStats() {
    const res = await apiClient.get('/api/employee/stats');
    return res.data;
  }

  async function addEmployee(payload) {
    await apiClient.post('/api/employee', payload);
    await refreshEmployees();
  }

  async function updateEmployee(id, payload) {
    await apiClient.put(`/api/employee/${id}`, payload);
    await refreshEmployees();
  }

  async function toggleStatus(id) {
    await apiClient.patch(`/api/employee/${id}/toggle-status`);
    await refreshEmployees();
  }

  const value = {
    employees, loading, error, refreshEmployees,
    fetchByBranch, fetchByRole, fetchOnShift, searchEmployees, fetchStats,
    addEmployee, updateEmployee, toggleStatus,
  };
  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
}

export function useEmployees() {
  return useContext(EmployeesContext);
}