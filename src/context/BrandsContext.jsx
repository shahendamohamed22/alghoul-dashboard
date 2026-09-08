import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

const BrandsContext = createContext(null);

export function BrandsProvider({ children }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  function refreshBrands() {
    return apiClient.get('/api/brand').then((res) => setBrands(res.data));
  }

  useEffect(() => {
    refreshBrands().finally(() => setLoading(false));
  }, []);

  async function fetchBrandById(id) {
    const res = await apiClient.get(`/api/brand/${id}`);
    return res.data;
  }

  async function addBrand(name) {
    await apiClient.post('/api/brand', { name });
    await refreshBrands();
  }

  const value = { brands, loading, refreshBrands, fetchBrandById, addBrand };
  return <BrandsContext.Provider value={value}>{children}</BrandsContext.Provider>;
}

export function useBrands() {
  return useContext(BrandsContext);
}