import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

// Translates the API's customer shape into the flatter shape the rest of
// the app already expects (single `name`, `branch`, etc.)
function mapCustomer(c) {
  return {
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    branch: c.preferredBranchName,
    totalOrders: c.totalOrders,
    totalSpent: c.totalSpent,
    lastVisit: c.lastVisit,
    isActive: c.isActive,
    createdAt: c.createdAt,
    tier: c.customerTier,
  };
}

const CustomersContext = createContext(null);

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refreshCustomers() {
    return apiClient.get('/api/customers').then((res) => setCustomers(res.data.map(mapCustomer)));
  }

  useEffect(() => {
    refreshCustomers()
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  async function fetchByBranch(branchId) {
    const res = await apiClient.get(`/api/customers/branch/${branchId}`);
    return res.data.map(mapCustomer);
  }

  async function fetchTopSpenders() {
    const res = await apiClient.get('/api/customers/top-spenders');
    return res.data.map(mapCustomer);
  }

  async function fetchNewThisMonth() {
    const res = await apiClient.get('/api/customers/new-this-month');
    return res.data.map(mapCustomer);
  }

  async function searchCustomers(keyword) {
    const res = await apiClient.get('/api/customers/search', { params: { keyword } });
    return res.data.map(mapCustomer);
  }

  // Raw stats - not mapped through mapCustomer since its shape is completely
  // different (aggregates, not a list of customers)
  async function fetchStats() {
    const res = await apiClient.get('/api/customers/stats');
    return res.data;
  }

  // No response body worth trusting here beyond a success message, so we
  // just flip the flag locally instead of re-fetching the whole list
  async function toggleStatus(id) {
    await apiClient.patch(`/api/customers/${id}/toggle-status`);
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  }

  const value = {
    customers, loading, error, refreshCustomers,
    fetchByBranch, fetchTopSpenders, fetchNewThisMonth, searchCustomers, fetchStats,
    toggleStatus,
  };
  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}

export function useCustomers() {
  return useContext(CustomersContext);
}