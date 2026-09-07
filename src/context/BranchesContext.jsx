import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

function mapBranch(b) {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    city: b.city,
    revenue: b.currentMonthRevenue,
    lastMonthRevenue: b.lastMonthRevenue,
    growth: b.revenueChangePercentage ?? 0,
    target: b.targetAchievementPercentage,
    orders: b.ordersCount,
    customers: b.customersCount,
    revenueTarget: b.revenueTarget,
    isActive: b.isActive,
    status: b.isOpenNow ? 'Open' : 'Closed',
  };
}

// The "basic" shape (plain GET /api/branch and GET /api/branch/{id}) is
// smaller than the stats shape - just profile fields, no revenue/orders
function mapBranchBasic(b) {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    city: b.city,
    phoneNumber: b.phoneNumber,
    openingTime: b.openingTime,
    closingTime: b.closingTime,
    isActive: b.isActive,
    revenueTarget: b.revenueTarget,
  };
}

const BranchesContext = createContext(null);

export function BranchesProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refreshBranches() {
    return apiClient.get('/api/branch/stats').then((res) => setBranches(res.data.map(mapBranch)));
  }

  useEffect(() => {
    refreshBranches()
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Search + IsOpen + SortBy + SortDir are all just query params on the
  // same /stats endpoint, so one function covers all of them combined
  async function fetchFiltered({ search, isOpen, sortBy, sortDir } = {}) {
    const params = {};
    if (search) params.Search = search;
    if (isOpen !== undefined && isOpen !== null) params.IsOpen = isOpen;
    if (sortBy) params.SortBy = sortBy;
    if (sortDir) params.SortDir = sortDir;
    const res = await apiClient.get('/api/branch/stats', { params });
    return res.data.map(mapBranch);
  }

  async function fetchTopPerforming() {
    const res = await apiClient.get('/api/branch/top-performers');
    return res.data.map(mapBranch);
  }

  async function fetchNeedsAttention() {
    const res = await apiClient.get('/api/branch/needs-attention');
    return res.data.map(mapBranch);
  }

  // Plain list, no auth needed per the doc - lighter than /stats
  async function fetchAllBasic() {
    const res = await apiClient.get('/api/branch');
    return res.data.map(mapBranchBasic);
  }

  async function fetchBranchById(id) {
    const res = await apiClient.get(`/api/branch/${id}`);
    return mapBranchBasic(res.data);
  }

  async function fetchBranchStats(id) {
    const res = await apiClient.get(`/api/branch/${id}/stats`);
    return mapBranch(res.data);
  }

  async function addBranch(data) {
    await apiClient.post('/api/branch', data);
    await refreshBranches();
  }

  async function updateBranch(id, data) {
    await apiClient.put(`/api/branch/${id}`, data);
    await refreshBranches();
  }

  async function toggleStatus(id) {
    await apiClient.patch(`/api/branch/${id}/toggle-status`);
    await refreshBranches();
  }

  const value = {
    branches, loading, error, refreshBranches,
    fetchFiltered, fetchTopPerforming, fetchNeedsAttention,
    fetchAllBasic, fetchBranchById, fetchBranchStats,
    addBranch, updateBranch, toggleStatus,
  };
  return <BranchesContext.Provider value={value}>{children}</BranchesContext.Provider>;
}

export function useBranches() {
  return useContext(BranchesContext);
}