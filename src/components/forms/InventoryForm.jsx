import { useState, useEffect } from 'react';
import { useBranches } from '../../context/BranchesContext';
import { useProducts } from '../../context/ProductsContext';

const emptyForm = { branchId: '', productId: '', quantity: '', lowStockThreshold: '', notes: '' };

export default function InventoryForm({ initialData, onSubmit, onCancel, submitLabel }) {
  const { branches } = useBranches();
  const { products } = useProducts();
  const [form, setForm] = useState(emptyForm);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        branchId: initialData.branchId,
        productId: initialData.productId,
        quantity: initialData.quantity ?? '',
        lowStockThreshold: initialData.lowStockThreshold ?? '',
        notes: '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isEditing) {
      onSubmit({
        quantity: Number(form.quantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 0,
        notes: form.notes,
      });
    } else {
      onSubmit({
        branchId: Number(form.branchId),
        productId: Number(form.productId),
        quantity: Number(form.quantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 0,
        notes: form.notes,
      });
    }
  }

  const branchName = branches.find((b) => b.id === initialData?.branchId)?.name ?? initialData?.branchName;
  const productName = products.find((p) => p.id === initialData?.productId)?.name ?? initialData?.productName;

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        {isEditing ? (
          <div className="mb-3 text-muted small">
            <div><strong>المنتج:</strong> {productName}</div>
            <div><strong>الفرع:</strong> {branchName}</div>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label small">الفرع *</label>
              <select className="form-select" name="branchId" value={form.branchId} onChange={handleChange} required>
                <option value="">-- اختاري فرع --</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small">المنتج *</label>
              <select className="form-select" name="productId" value={form.productId} onChange={handleChange} required>
                <option value="">-- اختاري منتج --</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">الكمية *</label>
            <input type="number" min="0" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">حد التنبيه (Low Stock)</label>
            <input type="number" min="0" className="form-control" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label small">ملاحظات</label>
          <input className="form-control" name="notes" value={form.notes} onChange={handleChange} />
        </div>
      </div>
      <div className="modal-footer border-0">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit" className="btn bg-brand-dark text-white">{submitLabel}</button>
      </div>
    </form>
  );
}