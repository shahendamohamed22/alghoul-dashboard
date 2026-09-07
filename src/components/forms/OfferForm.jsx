import { useState, useEffect } from 'react';

const emptyForm = { title: '', description: '', type: 'percentage', discountPercentage: '', bundlePrice: '', startDate: '', endDate: '', image: null };

export default function OfferForm({ initialData, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'percentage',
        discountPercentage: initialData.discountPercentage ?? '',
        bundlePrice: initialData.bundlePrice ?? '',
        startDate: initialData.startDate?.slice(0, 10) || '',
        endDate: initialData.endDate?.slice(0, 10) || '',
        image: null,
      });
      setPreview(initialData.imageUrl || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
  }, [initialData]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      title: form.title,
      description: form.description,
      type: form.type,
      discountPercentage: form.type === 'percentage' ? Number(form.discountPercentage) || 0 : undefined,
      bundlePrice: form.type === 'package' ? Number(form.bundlePrice) || 0 : undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      image: form.image,
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
        {form.type === 'percentage' ? (
          <div className="mb-3">
            <label className="form-label small">نسبة الخصم (%) *</label>
            <input type="number" min="0" max="100" className="form-control" name="discountPercentage" value={form.discountPercentage} onChange={handleChange} required />
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label small">سعر الباقة الإجمالي *</label>
            <input type="number" min="0" step="0.01" className="form-control" name="bundlePrice" value={form.bundlePrice} onChange={handleChange} required />
          </div>
        )}
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
        <div className="mb-3">
          <label className="form-label small">صورة العرض</label>
          <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
          {preview && <img src={preview} alt="preview" className="mt-2 rounded-3" style={{ maxHeight: 100 }} />}
        </div>
      </div>
      <div className="modal-footer border-0">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit" className="btn bg-brand-dark text-white">{submitLabel}</button>
      </div>
    </form>
  );
}