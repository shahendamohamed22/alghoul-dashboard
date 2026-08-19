import { useState, useEffect } from 'react';
import { useBranches } from '../../context/BranchesContext';

const emptyForm = { name: '', branch: '', totalOrders: 0, totalSpent: 0, lastVisit: '', status: 'Active' };

export default function CustomerForm({ initialData, onSubmit, onCancel, submitLabel }) {
  const { branches } = useBranches();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm);
  }, [initialData]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      totalOrders: Number(form.totalOrders) || 0,
      totalSpent: Number(form.totalSpent) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        <div className="mb-3">
          <label className="form-label small">Customer Name *</label>
          <input className="form-control" name="name" placeholder="e.g. Sarah Johnson" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">Branch</label>
          <select className="form-select" name="branch" value={form.branch} onChange={handleChange}>
            <option value="">-- اختاري فرع --</option>
            {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Total Orders</label>
            <input type="number" min="0" className="form-control" name="totalOrders" value={form.totalOrders} onChange={handleChange} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Total Spent ($)</label>
            <input type="number" min="0" className="form-control" name="totalSpent" value={form.totalSpent} onChange={handleChange} />
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Last Visit</label>
            <input type="date" className="form-control" name="lastVisit" value={form.lastVisit} onChange={handleChange} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      <div className="modal-footer border-0">
        <button type="button" className="btn btn-outline-secondary me-2" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn bg-brand-dark text-white">{submitLabel}</button>
      </div>
    </form>
  );
}
