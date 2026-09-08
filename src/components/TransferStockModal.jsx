import { useState } from 'react';
import { useBranches } from '../context/BranchesContext';
import { useProducts } from '../context/ProductsContext';
import { useInventory } from '../context/InventoryContext';

export default function TransferStockModal({ isOpen, onClose }) {
  const { branches } = useBranches();
  const { products } = useProducts();
  const { transferStock } = useInventory();
  const [form, setForm] = useState({ productId: '', fromBranchId: '', toBranchId: '', quantity: '', notes: '' });

  if (!isOpen) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await transferStock({
      productId: Number(form.productId),
      fromBranchId: Number(form.fromBranchId),
      toBranchId: Number(form.toBranchId),
      quantity: Number(form.quantity),
      notes: form.notes,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 p-2">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">تحويل مخزون بين الفروع</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body pt-0">
              <div className="mb-3">
                <label className="form-label small">المنتج *</label>
                <select className="form-select" name="productId" value={form.productId} onChange={handleChange} required>
                  <option value="">-- اختاري منتج --</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label small">من فرع *</label>
                  <select className="form-select" name="fromBranchId" value={form.fromBranchId} onChange={handleChange} required>
                    <option value="">-- اختاري --</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label small">إلى فرع *</label>
                  <select className="form-select" name="toBranchId" value={form.toBranchId} onChange={handleChange} required>
                    <option value="">-- اختاري --</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small">الكمية *</label>
                <input type="number" min="1" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label small">ملاحظات</label>
                <input className="form-control" name="notes" value={form.notes} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>إلغاء</button>
              <button type="submit" className="btn bg-brand-dark text-white">تحويل</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}