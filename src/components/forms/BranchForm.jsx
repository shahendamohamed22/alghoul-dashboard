import { useState, useEffect } from 'react';

const emptyForm = { name: '', address: '', manager: '', openingTime: '', closingTime: '' };

export default function BranchForm({ initialData, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm);
  }, [initialData]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        <div className="mb-3">
          <label className="form-label small">Branch Name *</label>
          <input className="form-control" name="name" placeholder="e.g. Uptown" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">Location/Address *</label>
          <input className="form-control" name="address" placeholder="123 Street Name" value={form.address} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">Manager Name</label>
          <input className="form-control" name="manager" placeholder="Manager full name" value={form.manager} onChange={handleChange} />
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Opening Time *</label>
            <input type="time" className="form-control" name="openingTime" value={form.openingTime} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Closing Time *</label>
            <input type="time" className="form-control" name="closingTime" value={form.closingTime} onChange={handleChange} required />
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
