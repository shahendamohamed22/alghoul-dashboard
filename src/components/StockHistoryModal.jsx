import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';

export default function StockHistoryModal({ row, onClose }) {
  const { fetchHistory } = useInventory();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (row) fetchHistory(row.productId, row.branchId).then(setHistory).catch(() => setHistory([]));
  }, [row]);

  if (!row) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 p-2">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">سجل الحركة: {row.productName}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-0" style={{ maxHeight: 400, overflowY: 'auto' }}>
            {history.length === 0 && <div className="text-muted small">لا يوجد سجل حركة</div>}
            <ul className="list-unstyled">
              {history.map((h) => (
                <li key={h.id} className="border-bottom py-2 small">
                  <div className="d-flex justify-content-between">
                    <span>{h.sourceBranchName} → {h.destinationBranchName}</span>
                    <span className="fw-semibold">{h.quantity}</span>
                  </div>
                  <div className="text-muted">{h.notes}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{new Date(h.transactionDate).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}