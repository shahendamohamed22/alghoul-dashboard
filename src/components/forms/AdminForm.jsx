import { useState } from 'react';

export default function AdminForm({ onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(form);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        setError(
          'غير مصرح لك'
        );
      } else {
        setError(
          err.response?.data?.message ||
          'حدث خطأ أثناء إنشاء الأدمن، تأكد من البيانات وحاول مرة أخرى'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger py-2 small">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label small">
            First Name *
          </label>

          <input
            type="text"
            className="form-control"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-6 mb-3">
          <label className="form-label small">
            Last Name *
          </label>

          <input
            type="text"
            className="form-control"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label small">
          Email *
        </label>

        <input
          type="email"
          className="form-control"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label small">
          Password *
        </label>

        <input
          type="password"
          className="form-control"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-light border w-50"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn bg-brand-dark text-white w-50"
          disabled={loading}
        >
          {loading ? 'جاري الإضافة...' : submitLabel || 'Add Admin'}
        </button>
      </div>
    </form>
  );
}
