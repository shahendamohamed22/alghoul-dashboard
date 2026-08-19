import { useState, useEffect } from 'react';

const emptyForm = { name: '', category: 'Produce', purchase: '', selling: '', vendor: '', updated: '' };
const categories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Beverages'];

export default function PricingForm({ initialData, onSubmit, onCancel, submitLabel }) {
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
      purchase: Number(form.purchase) || 0,
      selling: Number(form.selling) || 0,
      updated: form.updated || new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        <div className="mb-3">
          <label className="form-label small">Item Name *</label>
          <input className="form-control" name="name" placeholder="e.g. Fresh Bananas" value={form.name} onChange={handleChange} required />
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Category</label>
            <select className="form-select" name="category" value={form.category} onChange={handleChange}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Vendor</label>
            <input className="form-control" name="vendor" placeholder="e.g. Tropical Farms" value={form.vendor} onChange={handleChange} />
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Purchase Price ($) *</label>
            <input type="number" min="0" step="0.01" className="form-control" name="purchase" value={form.purchase} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Selling Price ($) *</label>
            <input type="number" min="0" step="0.01" className="form-control" name="selling" value={form.selling} onChange={handleChange} required />
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
