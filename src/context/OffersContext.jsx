import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../data/apiClient';

function mapOffer(o) {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    imageUrl: o.imageUrl,
    type: o.bundlePrice != null ? 'package' : 'percentage',
    discountPercentage: o.discountPercentage,
    bundlePrice: o.bundlePrice,
    startDate: o.startDate,
    endDate: o.endDate,
    isActive: o.isActive,
    status: o.status, // "Active" / "Ended" / "Stopped" / "Upcoming" - comes pre-computed from the server
    requestsCount: o.requestsCount,
    productsCount: o.productsCount,
    totalOfferPrice: o.totalOfferPrice,
    products: o.products ?? [],
  };
}

const OffersContext = createContext(null);

export function OffersProvider({ children }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refreshOffers() {
    return apiClient.get('/api/offer').then((res) => setOffers(res.data.map(mapOffer)));
  }

  useEffect(() => {
    refreshOffers().catch((err) => setError(err)).finally(() => setLoading(false));
  }, []);

  async function fetchFiltered({ searchTerm, status, offerType, sortBy } = {}) {
    const params = {};
    if (searchTerm) params.SearchTerm = searchTerm;
    if (status) params.Status = status;
    if (offerType) params.OfferType = offerType;
    if (sortBy) params.SortBy = sortBy;
    const res = await apiClient.get('/api/offer', { params });
    return res.data.map(mapOffer);
  }

  async function fetchOfferById(id) {
    const res = await apiClient.get(`/api/offer/${id}`);
    return mapOffer(res.data);
  }

  async function fetchStats() {
    const res = await apiClient.get('/api/offer/stats');
    return res.data;
  }

  // Create/Update need multipart/form-data because of the image upload.
  // We build the FormData here so OfferForm can just hand us plain values.
  function buildFormData(data) {
    const formData = new FormData();
    formData.append('Title', data.title);
    formData.append('Description', data.description ?? '');
    if (data.type === 'package') {
      formData.append('BundlePrice', data.bundlePrice);
    } else {
      formData.append('DiscountPercentage', data.discountPercentage);
    }
    formData.append('StartDate', data.startDate);
    formData.append('EndDate', data.endDate);
    if (data.image) formData.append('Image', data.image);
    return formData;
  }

  async function addOffer(data) {
    await apiClient.post('/api/offer', buildFormData(data));
    await refreshOffers();
  }

  async function updateOffer(id, data) {
    const formData = buildFormData(data);
    formData.append('Id', id);
    await apiClient.put(`/api/offer/${id}`, formData);
    await refreshOffers();
  }

  async function deleteOffer(id) {
    await apiClient.delete(`/api/offer/${id}`);
    await refreshOffers();
  }

  async function toggleStatus(id) {
    await apiClient.patch(`/api/offer/${id}/toggle-status`);
    await refreshOffers();
  }

  async function addProductToOffer(offerId, productId, quantity) {
    await apiClient.post(`/api/offer/${offerId}/products`, { productId, quantity });
    await refreshOffers();
  }

  async function removeProductFromOffer(offerId, productId) {
    await apiClient.delete(`/api/offer/${offerId}/products/${productId}`);
    await refreshOffers();
  }

  // The export endpoint returns a raw CSV file, not JSON - so we ask axios
  // for a blob and trigger a normal browser download manually
  async function exportCsv(status) {
    const params = status ? { Status: status } : {};
    const res = await apiClient.get('/api/offer/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Offers_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const value = {
    offers, loading, error, refreshOffers,
    fetchFiltered, fetchOfferById, fetchStats,
    addOffer, updateOffer, deleteOffer, toggleStatus,
    addProductToOffer, removeProductFromOffer, exportCsv,
  };
  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  return useContext(OffersContext);
}