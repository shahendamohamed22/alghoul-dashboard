import { useState, useEffect } from 'react';
import { usePricing } from '../context/PricingContext';

export default function EditPriceModal({ item, onClose }) {
  const { updatePrice } = usePricing();
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  useEffect(() => {
    if (item) {
      setPurchasePrice(item.purchasePrice ?? '');
      setSellingPrice(item.sellingPrice ?? '');
    }
  }, [item]);

  if (!item) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    await updatePrice(item.productId, { purchasePrice, sellingPrice });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-white rounded-4 p-3">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">تعديل سعر: {item.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body pt-0">
              <div className="mb-3">
                <label className="form-label small">سعر الشراء ($)</label>
                <input type="number" min="0" step="0.01" className="form-control" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label small">سعر البيع ($)</label>
                <input type="number" min="0" step="0.01" className="form-control" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
              </div>
              <div className="text-muted small">لازم تملى حقل واحد على الأقل</div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>إلغاء</button>
              <button type="submit" className="btn bg-brand-dark text-white ms-2">حفظ</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}