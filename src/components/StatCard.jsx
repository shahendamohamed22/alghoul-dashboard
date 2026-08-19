export default function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white border rounded-4 p-3 h-100">
      <div
        className="bg-brand-light text-brand-green rounded-3 d-flex align-items-center justify-content-center mb-3"
        style={{ width: 38, height: 38 }}
      >
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="fs-4 fw-bold">{value}</div>
      <div className="text-muted small">{label}</div>
    </div>
  );
}
