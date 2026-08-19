import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../data/api';
import token from '../data/token';

const authHeader = { headers: { Authorization: `Bearer ${token}` } };

export const roleMap = { Manager: 0, Cashier: 1, Stocker: 2, Butcher: 3 };
export const statusMap = { Active: 0, OnLeave: 1, Inactive: 2 };
// بترجم شكل بيانات الموظف الجاي من الـ API لنفس الأسماء اللي
// صفحة Employees والجدول متعودين عليها (name, branch, start, end...)
function mapEmployee(e) {
  return {
    id: e.id,
    code: e.employeeCode,
    name: e.fullName,
    email: e.email,
    phone: e.phoneNumber,
    role: e.role,
    branch: e.branchName,
    start: e.workStart?.slice(0, 5), // "09:00:00" -> "09:00"
    end: e.workEnd?.slice(0, 5),
    status: e.status,
    isOnShift: e.isOnShift,
  };
}

const EmployeesContext = createContext(null);

export function EmployeesProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseUrl}/api/employees`, authHeader)
      .then((res) => setEmployees(res.data.map(mapEmployee)))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);


  async function fetchByBranch(branchId) {
    const res = await axios.get(`${baseUrl}/api/employees/branch/${branchId}`, authHeader);
    return res.data.map(mapEmployee);
  }

  async function fetchByRole(roleId) {
    const res = await axios.get(`${baseUrl}/api/employees/role/${roleId}`, authHeader);
    return res.data.map(mapEmployee);
  }

  async function fetchOnShift() {
    const res = await axios.get(`${baseUrl}/api/employees/on-shift`, authHeader);
    console.log(res.data);
    return res.data.map(mapEmployee);
    
  } 
  
  async function addEmployee(payload) {
    const res = await axios.post(`${baseUrl}/api/employees`, payload, authHeader);
    setEmployees((prev) => [...prev, mapEmployee(res.data)]);
  }

  async function updateEmployee(id, payload) {
    const res = await axios.put(`${baseUrl}/api/employees/${id}`, payload, authHeader);
    setEmployees((prev) => prev.map((e) => (e.id === id ? mapEmployee(res.data) : e)));
  }

  async function deleteEmployee(id) {
    await axios.delete(`${baseUrl}/api/employees/${id}`, authHeader);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }


  async function searchEmployees(keyword) {
    const res = await axios.get(`${baseUrl}/api/employees/search`, {
      params: { keyword },
      headers: authHeader.headers,
    });
    return res.data.map(mapEmployee);
  }

  const value = { employees, loading, error, addEmployee, updateEmployee, deleteEmployee , fetchByBranch ,fetchByRole , fetchOnShift , searchEmployees};
  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
}

export function useEmployees() {
  return useContext(EmployeesContext);
}