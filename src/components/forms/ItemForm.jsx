import { useState, useEffect } from 'react';
import { useBranches } from '../../context/BranchesContext';

const emptyForm = { name: '', sku: '', category: 'Produce', branch: '', quantity: '', status: 'In Stock' };
const categories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Beverages'];

export default function ItemForm({ initialData, onSubmit, onCancel, submitLabel }) {
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
    onSubmit({ ...form, quantity: Number(form.quantity) || 0 });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        <div className="mb-3">
          <label className="form-label small">Item Name *</label>
          <input className="form-control" name="name" placeholder="e.g. Fresh Bananas" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">SKU *</label>
          <input className="form-control" name="sku" placeholder="e.g. PRD-011" value={form.sku} onChange={handleChange} required />
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Category</label>
            <select className="form-select" name="category" value={form.category} onChange={handleChange}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Branch</label>
            <select className="form-select" name="branch" value={form.branch} onChange={handleChange}>
              <option value="">-- اختاري فرع --</option>
              {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Quantity *</label>
            <input type="number" min="0" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleChange}>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
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
