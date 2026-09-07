import { useState } from 'react';
import { useOffers } from '../context/OffersContext';
import { useProducts } from '../context/ProductsContext';

export default function OfferProductsModal({ offer, onClose }) {
  const { addProductToOffer, removeProductFromOffer } = useOffers();
  const { products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!offer) return null;

  async function handleAdd() {
    if (!selectedProductId) return;
    await addProductToOffer(offer.id, Number(selectedProductId), Number(quantity) || 1);
    setSelectedProductId('');
    setQuantity(1);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 p-2">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">منتجات عرض: {offer.title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-0">
            <ul className="list-unstyled mb-3">
              {offer.products.length === 0 && <li className="text-muted small">لا يوجد منتجات مضافة بعد</li>}
              {offer.products.map((p) => (
                <li key={p.productId} className="d-flex justify-content-between align-items-center border-bottom py-2">
                  <span>{p.productName} <span className="text-muted small">x{p.quantity}</span></span>
                  <i
                    className="fa-solid fa-trash text-danger row-action-icon"
                    role="button"
                    onClick={() => removeProductFromOffer(offer.id, p.productId)}
                  ></i>
                </li>
              ))}
            </ul>

            <div className="d-flex gap-2">
              <select className="form-select" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                <option value="">-- اختار منتج --</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min="1" className="form-control" style={{ width: 80 }} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <button className="btn bg-brand-dark text-white" onClick={handleAdd}>إضافة</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}