import { useState, useEffect } from 'react';

const emptyForm = { title: '', description: '', type: 'percentage', value: '', totalPrice: '', startDate: '', endDate: '' };

export default function OfferForm({ initialData, onSubmit, onCancel, submitLabel }) {
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
      value: Number(form.value) || 0,
      totalPrice: Number(form.totalPrice) || 0,
      productsCount: form.productsCount ? Number(form.productsCount) : (initialData?.productsCount ?? 0),
      requestsCount: initialData?.requestsCount ?? 0,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        <div className="mb-3">
          <label className="form-label small">عنوان العرض *</label>
          <input className="form-control" name="title" placeholder="مثل: تخفيضات الصيف" value={form.title} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">الوصف</label>
          <input className="form-control" name="description" placeholder="وصف مختصر" value={form.description} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label small">نوع العرض *</label>
          <select className="form-select" name="type" value={form.type} onChange={handleChange}>
            <option value="percentage">نسبة مئوية</option>
            <option value="package">سعر باقة</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label small">قيمة العرض *</label>
          <input type="number" min="0" className="form-control" name="value" placeholder="20" value={form.value} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">السعر الإجمالي للعرض *</label>
          <input type="number" min="0" step="0.01" className="form-control" name="totalPrice" placeholder="0.00" value={form.totalPrice} onChange={handleChange} required />
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">تاريخ البداية *</label>
            <input type="date" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">تاريخ النهاية *</label>
            <input type="date" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} required />
          </div>
        </div>
      </div>
      <div className="modal-footer border-0">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit" className="btn bg-brand-dark text-white"><i className="fa-solid fa-floppy-disk me-1"></i> {submitLabel}</button>
      </div>
    </form>
  );
}