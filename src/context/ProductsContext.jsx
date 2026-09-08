import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

// Numbers from the authoritative enum list at the bottom of your doc
export const unitTypeMap = { Piece: 1, Kilogram: 2, Gram: 3, Liter: 4, Packet: 5, Carton: 6 };
export const weightUnitMap = { Gram: 1, Kilogram: 2, Milliliter: 3, Liter: 4 };

// The API sometimes returns short labels ("Kg") instead of the full enum
// name ("Kilogram") in GET responses - this normalizes either form back
// to the enum number we need to send on update.
function normalizeEnum(map, label) {
  if (!label) return '';
  const found = Object.keys(map).find((key) => key.toLowerCase().startsWith(String(label).toLowerCase().slice(0, 2)));
  return found ? map[found] : '';
}

// Row shape from GET /api/product/dashboard/filter - what the table uses
function mapProductRow(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.categoryName,
    brand: p.brandName,
    priceBefore: p.priceBeforeDiscount,
    priceAfter: p.priceAfterDiscount,
    discount: p.discountPercentage,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    isActive: p.isActive,
  };
}

// Full shape from GET /api/product/{id} - what the edit form uses
function mapProductFull(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    sellingPrice: p.oldPrice,
    discountPercentage: p.discountPercentage,
    unitType: p.unitType,
    weight: p.weight,
    weightUnit: p.weightUnit,
    categoryName: p.categoryName,
    brandName: p.brandName,
    images: p.images ?? [],
    isAvailable: p.isAvailable,
  };
}

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refreshProducts(filters) {
    return fetchFiltered(filters).then(setProducts);
  }

  useEffect(() => {
    refreshProducts().catch((err) => setError(err)).finally(() => setLoading(false));
  }, []);

  async function fetchFiltered({ searchTerm, categoryId, brandId, hasDiscount, isActive, sortBy } = {}) {
    const params = {};
    if (searchTerm) params.SearchTerm = searchTerm;
    if (categoryId) params.CategoryId = categoryId;
    if (brandId) params.BrandId = brandId;
    if (hasDiscount !== undefined) params.HasDiscount = hasDiscount;
    if (isActive !== undefined) params.IsActive = isActive;
    if (sortBy) params.SortBy = sortBy;
    const res = await apiClient.get('/api/product/dashboard/filter', { params });
    return res.data.map(mapProductRow);
  }

  async function fetchProductById(id) {
    const res = await apiClient.get(`/api/product/${id}`);
    return mapProductFull(res.data);
  }

  async function fetchDashboardStats() {
    const res = await apiClient.get('/api/product/dashboard/stats');
    return res.data;
  }

  async function fetchCategoryChart() {
    const res = await apiClient.get('/api/product/dashboard/charts/category-distribution');
    return res.data;
  }

  async function fetchPriceChart() {
    const res = await apiClient.get('/api/product/dashboard/charts/price-distribution');
    return res.data;
  }

  function buildFormData(data) {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('Description', data.description ?? '');
    formData.append('Price', data.sellingPrice);
    formData.append('PurchasePrice', data.purchasePrice ?? 0);
    formData.append('DiscountPercentage', data.discountPercentage ?? 0);
    formData.append('UnitType', data.unitType);
    formData.append('Weight', data.weight ?? 0);
    formData.append('WeightUnit', data.weightUnit);
    formData.append('CategoryId', data.categoryId);
    formData.append('BrandId', data.brandId);
    (data.images ?? []).forEach((file) => formData.append('Images', file));
    (data.imageIdsToDelete ?? []).forEach((id) => formData.append('ImageIdsToDelete', id));
    return formData;
  }

  async function addProduct(data) {
    await apiClient.post('/api/product', buildFormData(data));
    await refreshProducts();
  }

  async function updateProduct(id, data) {
    await apiClient.put(`/api/product/${id}`, buildFormData(data));
    await refreshProducts();
  }

  async function toggleStatus(id) {
    await apiClient.patch(`/api/product/dashboard/${id}/toggle-status`);
    await refreshProducts();
  }

  const value = {
    products, loading, error, refreshProducts,
    fetchFiltered, fetchProductById, fetchDashboardStats, fetchCategoryChart, fetchPriceChart,
    addProduct, updateProduct, toggleStatus,
  };
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}

export { normalizeEnum };