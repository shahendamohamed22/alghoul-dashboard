import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [grid, setGrid] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refreshGrid(filters) {
    return fetchGrid(filters).then(setGrid);
  }

  function refreshSummary() {
    return apiClient.get('/api/branchinventory/summary').then((res) => setSummary(res.data));
  }

  useEffect(() => {
    Promise.all([refreshGrid(), refreshSummary()])
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  async function fetchGrid({ searchTerm, branchId, categoryId, status } = {}) {
    const params = {};
    if (searchTerm) params.SearchTerm = searchTerm;
    if (branchId) params.BranchId = branchId;
    if (categoryId) params.CategoryId = categoryId;
    if (status) params.Status = status;
    const res = await apiClient.get('/api/branchinventory/grid', { params });
    return res.data;
  }

  async function fetchHistory(productId, branchId) {
    const res = await apiClient.get('/api/branchinventory/history', { params: { productId, branchId } });
    return res.data;
  }

  async function fetchStatusChart() {
    const res = await apiClient.get('/api/branchinventory/charts/status');
    return res.data;
  }

  async function fetchValueChart() {
    const res = await apiClient.get('/api/branchinventory/charts/value');
    return res.data;
  }

  async function addInventory(data) {
    await apiClient.post('/api/branchinventory', data);
    await Promise.all([refreshGrid(), refreshSummary()]);
  }

  // Composite key - no single "id" for an inventory row, it's identified
  // by which product + which branch
  async function updateInventory(productId, branchId, data) {
    await apiClient.put(`/api/branchinventory/product/${productId}/branch/${branchId}`, data);
    await Promise.all([refreshGrid(), refreshSummary()]);
  }

  async function transferStock(data) {
    await apiClient.post('/api/branchinventory/transfer', data);
    await Promise.all([refreshGrid(), refreshSummary()]);
  }

  async function exportCsv({ branchId, status } = {}) {
    const params = {};
    if (branchId) params.branchId = branchId;
    if (status) params.status = status;
    const res = await apiClient.get('/api/branchinventory/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const value = {
    grid, summary, loading, error, refreshGrid, refreshSummary,
    fetchGrid, fetchHistory, fetchStatusChart, fetchValueChart,
    addInventory, updateInventory, transferStock, exportCsv,
  };
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  return useContext(InventoryContext);
}