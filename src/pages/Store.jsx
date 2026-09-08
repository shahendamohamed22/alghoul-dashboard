import { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useBranches } from '../context/BranchesContext';
import { useCategories } from '../context/CategoriesContext';
import { useModal } from '../context/ModalContext';
import StatCard from '../components/StatCard';
import ChartCanvas from '../components/ChartCanvas';
import TransferStockModal from '../components/TransferStockModal';
import StockHistoryModal from '../components/StockHistoryModal';

const statusColors = { InStock: 'success', LowStock: 'warning', OutOfStock: 'danger' };

export default function Store() {
  const { grid, summary, fetchGrid, fetchStatusChart, fetchValueChart, exportCsv } = useInventory();
  const { branches } = useBranches();
  const { flatCategories } = useCategories();
  const { openAdd, openEdit } = useModal();

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [displayed, setDisplayed] = useState(null);
  const [statusChartData, setStatusChartData] = useState([]);
  const [valueChartData, setValueChartData] = useState([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [historyRow, setHistoryRow] = useState(null);

  useEffect(() => {
    fetchStatusChart().then(setStatusChartData).catch(() => setStatusChartData([]));
    fetchValueChart().then(setValueChartData).catch(() => setValueChartData([]));
  }, [grid]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGrid({
        searchTerm: search.trim() || undefined,
        branchId: branchFilter || undefined,
        categoryId: categoryFilter || undefined,
        status: statusFilter || undefined,
      }).then(setDisplayed);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search, branchFilter, categoryFilter, statusFilter]);

  const filteredGrid = displayed ?? grid;

  const statusChartConfig = useMemo(() => ({
    type: 'bar',
    data: {
      labels: statusChartData.map((d) => d.branchName),
      datasets: [
        { label: 'In Stock', data: statusChartData.map((d) => d.inStockCount), backgroundColor: '#1f6b4d' },
        { label: 'Low Stock', data: statusChartData.map((d) => d.lowStockCount), backgroundColor: '#f0a93a' },
        { label: 'Out of Stock', data: statusChartData.map((d) => d.outOfStockCount), backgroundColor: '#dc3545' },
      ],
    },
    options: { maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } },
  }), [statusChartData]);

  const valueChartConfig = useMemo(() => ({
    type: 'bar',
    data: { labels: valueChartData.map((d) => d.branchName), datasets: [{ data: valueChartData.map((d) => d.totalValue), backgroundColor: '#1f6b4d', borderRadius: 4 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
  }), [valueChartData]);

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-0">Store</h1>
        <div className="text-muted small">Branch inventory management</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-box" value={summary?.totalItemsCount ?? '-'} label="Total Items" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-coins" value={summary ? `$${summary.totalStockValue.toLocaleString()}` : '-'} label="Total Stock Value" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-shop" value={summary?.activeBranchesCount ?? '-'} label="Active Branches" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-triangle-exclamation" value={summary?.lowStockCount ?? '-'} label="Low Stock Items" /></div>
        <div className="col-6 col-lg-2-4"><StatCard icon="fa-circle-xmark" value={summary?.outOfStockCount ?? '-'} label="Out of Stock" /></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Stock Status by Branch</h6>
            <div style={{ height: 260 }}><ChartCanvas config={statusChartConfig} /></div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Stock Value by Branch</h6>
            <div style={{ height: 260 }}><ChartCanvas config={valueChartConfig} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass position-absolute text-muted" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}></i>
              <input type="text" className="form-control ps-4" style={{ minWidth: 180 }} placeholder="ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 140 }} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
              <option value="">كل الفروع</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">كل التصنيفات</option>
              {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">كل الحالات</option>
              <option value="InStock">In Stock</option>
              <option value="LowStock">Low Stock</option>
              <option value="OutOfStock">Out of Stock</option>
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn bg-brand-dark text-white btn-sm" onClick={() => openAdd('item')}>
              <i className="fa-solid fa-plus"></i> Add Inventory
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setTransferOpen(true)}>
              <i className="fa-solid fa-right-left"></i> Transfer
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => exportCsv({ branchId: branchFilter || undefined, status: statusFilter || undefined })}>
              <i className="fa-solid fa-download"></i> Export CSV
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr className="text-muted small">
                <th>ITEM NAME</th><th>CATEGORY</th><th>BRANCH</th>
                <th>QUANTITY</th><th>SALES RATE</th><th>COVERAGE</th><th>STATUS</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrid.map((row) => (
                <tr key={`${row.productId}-${row.branchId}`}>
                  <td>{row.productName}</td>
                  <td>{row.categoryName}</td>
                  <td>{row.branchName}</td>
                  <td>{row.quantity}</td>
                  <td className="text-muted">{row.salesRate}</td>
                  <td className="text-muted">{row.coverageDays} يوم</td>
                  <td><span className={`badge bg-${statusColors[row.status] ?? 'secondary'}-subtle text-${statusColors[row.status] ?? 'secondary'}`}>{row.status}</span></td>
                  <td>
                    <i className="fa-solid fa-pen text-muted me-3 row-action-icon" role="button" onClick={() => openEdit('item', row)}></i>
                    <i className="fa-solid fa-clock-rotate-left text-muted row-action-icon" role="button" title="سجل الحركة" onClick={() => setHistoryRow(row)}></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransferStockModal isOpen={transferOpen} onClose={() => setTransferOpen(false)} />
      <StockHistoryModal row={historyRow} onClose={() => setHistoryRow(null)} />
    </>
  );
}