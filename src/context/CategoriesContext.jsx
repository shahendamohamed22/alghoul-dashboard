import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]); // tree shape (with subCategories)
  const [flatCategories, setFlatCategories] = useState([]); // flat list, for dropdowns
  const [loading, setLoading] = useState(true);

  function refreshCategories() {
    return Promise.all([
      apiClient.get('/api/category').then((res) => setCategories(res.data)),
      apiClient.get('/api/category/flat-categories').then((res) => setFlatCategories(res.data)),
    ]);
  }

  useEffect(() => {
    refreshCategories().finally(() => setLoading(false));
  }, []);

  async function fetchCategoryById(id) {
    const res = await apiClient.get(`/api/category/${id}`);
    return res.data;
  }

  // Create needs multipart/form-data because of the optional image
  async function addCategory({ name, parentCategoryId, image }) {
    const formData = new FormData();
    formData.append('Name', name);
    if (parentCategoryId) formData.append('ParentCategoryId', parentCategoryId);
    if (image) formData.append('Image', image);
    await apiClient.post('/api/category', formData);
    await refreshCategories();
  }

  const value = { categories, flatCategories, loading, refreshCategories, fetchCategoryById, addCategory };
  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  return useContext(CategoriesContext);
}