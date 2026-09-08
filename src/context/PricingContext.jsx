import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

function mapPricingRow(p) {
  return {
    productId: p.productId,
    name: p.itemName,
    category: p.categoryName,
    purchasePrice: p.purchasePrice,
    sellingPrice: p.sellingPrice,
    margin: p.marginPercentage,
    brand: p.brand,
    lastUpdated: p.lastUpdated,
  };
}

const PricingContext = createContext(null);

export function PricingProvider({ children }) {
  const [pricingItems, setPricingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refreshPricing(filters) {
    return fetchTable(filters).then(setPricingItems);
  }

  useEffect(() => {
    refreshPricing().catch((err) => setError(err)).finally(() => setLoading(false));
  }, []);

  async function fetchTable({ searchTerm, categoryId, lowMargin, recentlyUpdated } = {}) {
    const params = {};
    if (searchTerm) params.searchterm = searchTerm;
    if (categoryId) params.categoryid = categoryId;
    if (lowMargin !== undefined) params.lowmargin = lowMargin;
    if (recentlyUpdated !== undefined) params.recentlyupdated = recentlyUpdated;
    const res = await apiClient.get('/api/product/pricing/table', { params });
    // The doc's example response shows a single object, but a "table" is
    // realistically an array - this handles either shape safely
    const rows = Array.isArray(res.data) ? res.data : [res.data];
    return rows.map(mapPricingRow);
  }

  async function fetchMarginByCategory() {
    const res = await apiClient.get('/api/product/pricing/charts/margin-by-category');
    return res.data;
  }

  async function fetchRevenueByTier() {
    const res = await apiClient.get('/api/product/pricing/charts/revenue-by-price-tier');
    return res.data;
  }

  async function fetchStats() {
    const res = await apiClient.get('/api/product/pricing/stats');
    return res.data;
  }

  // At least one of the two fields is required by the API - the caller
  // decides which one(s) to send
  async function updatePrice(productId, { purchasePrice, sellingPrice }) {
    const payload = {};
    if (purchasePrice !== undefined && purchasePrice !== '') payload.PurchasePrice = Number(purchasePrice);
    if (sellingPrice !== undefined && sellingPrice !== '') payload.SellingPrice = Number(sellingPrice);
    await apiClient.patch(`/api/product/${productId}/price`, payload);
    await refreshPricing();
  }

  const value = {
    pricingItems, loading, error, refreshPricing,
    fetchTable, fetchMarginByCategory, fetchRevenueByTier, fetchStats,
    updatePrice,
  };
  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  return useContext(PricingContext);
}