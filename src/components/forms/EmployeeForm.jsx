import { useState, useEffect } from 'react';
import { useBranches } from '../../context/BranchesContext';
import { roleMap, statusMap } from '../../context/EmployeesContext';

const roleNames = Object.keys(roleMap);
const statusNames = Object.keys(statusMap);

const emptyForm = {
  fullName: '', email: '', phoneNumber: '',
  branchId: '', role: 0, workStart: '', workEnd: '', status: 0,
};

export default function EmployeeForm({ initialData, onSubmit, onCancel, submitLabel }) {
  const { branches } = useBranches();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      // initialData جاي من mapEmployee (فيه name, branch كنص, role كنص...)
      // فبنـ"يترجمه" بالعكس هنا عشان الفورم يشتغل بالـ id/رقم
      const branch = branches.find((b) => b.name === initialData.branch);
      setForm({
        fullName: initialData.name || '',
        email: initialData.email || '',
        phoneNumber: initialData.phone || '',
        branchId: branch?.id || '',
        role: roleMap[initialData.role] ?? 0,
        workStart: initialData.start || '',
        workEnd: initialData.end || '',
        status: statusMap[initialData.status] ?? 0,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, branches]);

  function handleChange(e) {
    const { name, value } = e.target;
    // الحقول الرقمية (role, status, branchId) لازم تتحول لرقم فعلي، مش تفضل نص
    const numericFields = ['role', 'status', 'branchId'];
    setForm({ ...form, [name]: numericFields.includes(name) ? Number(value) : value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // الـ workStart/workEnd الفورم بيرجعها "09:00"، والـ API عايزها "09:00:00"
    const payload = {
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      email: form.email,
      role: form.role,
      branchId: form.branchId,
      workStart: form.workStart.length === 5 ? `${form.workStart}:00` : form.workStart,
      workEnd: form.workEnd.length === 5 ? `${form.workEnd}:00` : form.workEnd,
    };
    // status بس بيتبعت لو بنعدل (الـ Create API مش طالبه أصلاً)
    if (initialData) payload.status = form.status;

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0">
        <div className="mb-3">
          <label className="form-label small">Employee Name *</label>
          <input className="form-control" name="fullName" placeholder="e.g. Alice Cooper" value={form.fullName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">Email *</label>
          <input type="email" className="form-control" name="email" placeholder="name@elghoul.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Branch *</label>
            <select className="form-select" name="branchId" value={form.branchId} onChange={handleChange} required>
              <option value="">-- اختاري فرع --</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Role *</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              {roleNames.map((name) => <option key={name} value={roleMap[name]}>{name}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Work Start *</label>
            <input type="time" className="form-control" name="workStart" value={form.workStart} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">Work End *</label>
            <input type="time" className="form-control" name="workEnd" value={form.workEnd} onChange={handleChange} required />
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">Phone</label>
            <input className="form-control" name="phoneNumber" placeholder="01012345678" value={form.phoneNumber} onChange={handleChange} />
          </div>
          {/* الـ status بيظهر بس وقت التعديل - الإضافة الجديدة بتتعمل Active افتراضيًا من السيرفر */}
          {initialData && (
            <div className="col-6 mb-3">
              <label className="form-label small">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                {statusNames.map((name) => <option key={name} value={statusMap[name]}>{name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="modal-footer border-0">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn bg-brand-dark text-white">{submitLabel}</button>
      </div>
    </form>
  );
}