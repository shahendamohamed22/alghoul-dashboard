import { useState, useEffect } from 'react';
import { productCategories, productBrands, unitTypes } from '../../data/products';

const emptyForm = {
  name: '', description: '', purchasePrice: '', sellingPrice: '',
  discount: '', unitType: 'kg', weight: '', category: '', brand: '',
};

export default function ProductForm({ initialData, onSubmit, onCancel, submitLabel }) {
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
      purchasePrice: Number(form.purchasePrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      discount: Number(form.discount) || 0,
      weight: form.weight ? Number(form.weight) : null,
      status: initialData?.status || 'active',
      rating: initialData?.rating ?? null,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        <div className="mb-3">
          <label className="form-label small">اسم المنتج *</label>
          <input className="form-control" name="name" placeholder="مثل: موز طازج" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">الوصف</label>
          <textarea className="form-control" name="description" rows="2" placeholder="وصف المنتج..." value={form.description} onChange={handleChange}></textarea>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">سعر الشراء *</label>
            <input type="number" min="0" step="0.01" className="form-control" name="purchasePrice" placeholder="2.50" value={form.purchasePrice} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">سعر البيع *</label>
            <input type="number" min="0" step="0.01" className="form-control" name="sellingPrice" placeholder="4.50" value={form.sellingPrice} onChange={handleChange} required />
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">نسبة الخصم (%)</label>
            <input type="number" min="0" max="100" className="form-control" name="discount" placeholder="10" value={form.discount} onChange={handleChange} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">نوع الوحدة *</label>
            <select className="form-select" name="unitType" value={form.unitType} onChange={handleChange} required>
              {unitTypes.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">الوزن</label>
            <input type="number" min="0" step="0.01" className="form-control" name="weight" placeholder="1.5" value={form.weight} onChange={handleChange} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">التصنيف *</label>
            <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
              <option value="">اختر التصنيف</option>
              {productCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label small">البراند</label>
          <select className="form-select" name="brand" value={form.brand} onChange={handleChange}>
            <option value="">اختر البراند (اختياري)</option>
            {productBrands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label small">الصور</label>
          <div className="border rounded-3 text-center p-4 text-muted small" style={{ borderStyle: 'dashed' }}>
            <i className="fa-solid fa-image fs-4 d-block mb-2"></i>
            رفع الصور غير متاح حاليًا (يحتاج ربط بالباك إند)
          </div>
        </div>
      </div>
      <div className="modal-footer border-0">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit" className="btn bg-brand-dark text-white">{submitLabel}</button>
      </div>
    </form>
  );
}