import { createContext, useContext, useState, useEffect } from 'react';
import baseUrl from '../data/api';
import token from '../data/token';
import axios from 'axios';

function mapBranch(b) {
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    city: b.city,
    revenue: b.currentMonthRevenue,
    growth: b.revenueChangePercentage ?? 0,
    target: b.targetAchievementPercentage,
    orders: b.ordersCount,
    customers: b.customersCount,
    status: b.isOpenNow ? 'Open' : 'Closed',
  };
}

const BranchesContext = createContext(null);

export function BranchesProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseUrl}/api/branches/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const mapped = res.data.map(mapBranch);
        setBranches(mapped);
        console.log(res.data);

      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // الدالتين الجداد - كل واحدة بترجع البيانات مباشرة (Promise)
  // بدل ما تخزنها في state هنا، عشان الصفحة نفسها هي اللي هتقرر تستخدمها إمتى
  async function fetchTopPerforming() {
    const res = await axios.get(`${baseUrl}/api/branches/top-performers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log("Top Performers Response:", res);
    console.log("Top Performers Data:", res.data);
    return res.data.map(mapBranch);
  }

  async function fetchNeedsAttention() {
    const res = await axios.get(`${baseUrl}/api/branches/needs-attention`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log("Needs Attention Response:", res);
    console.log("Needs Attention Data:", res.data);

    return res.data.map(mapBranch);
  }

  async function searchBranches(keyword) {
  const res = await axios.get(`${baseUrl}/api/branches/search`, {
    params: { keyword: keyword },
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("search Response:", res);
    console.log("search Data:", res.data);
  return res.data.map(mapBranch);
}

  function addBranch(data) {
    setBranches((prev) => [...prev, { id: Date.now(), ...data }]);
  }

  function updateBranch(id, data) {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }

  function deleteBranch(id) {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  }

  const value = {
    branches, loading, error,
    fetchTopPerforming, fetchNeedsAttention,searchBranches,
    addBranch, updateBranch, deleteBranch,
  }; return <BranchesContext.Provider value={value}>{children}</BranchesContext.Provider>;
}

export function useBranches() {
  return useContext(BranchesContext);
}
