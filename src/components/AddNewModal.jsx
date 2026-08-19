import { useModal } from '../context/ModalContext';
import { useBranches } from '../context/BranchesContext';
import { useItems } from '../context/ItemsContext';
import { useEmployees } from '../context/EmployeesContext';
import { useCustomers } from '../context/CustomersContext';
import { usePricing } from '../context/PricingContext';
import { useOffers } from '../context/OffersContext';

import BranchForm from './forms/BranchForm';
import ItemForm from './forms/ItemForm';
import EmployeeForm from './forms/EmployeeForm';
import CustomerForm from './forms/CustomerForm';
import PricingForm from './forms/PricingForm';
import OfferForm from './forms/OfferForm';

// كل تاب بيعرف: اسمه، أيقونته، وأسماء أفعال الإضافة/التعديل بتاعته
// (asAdd/asUpdate) - ده اللي بيخلي المودال الواحد ده "يعرف" يكلم أي Context صح
const tabs = [
  { key: 'branch', label: 'Branch', icon: 'fa-shop' },
  { key: 'item', label: 'Item', icon: 'fa-box' },
  { key: 'employee', label: 'Employee', icon: 'fa-user-gear' },
  { key: 'customer', label: 'Customer', icon: 'fa-users' },
  { key: 'price', label: 'Price', icon: 'fa-tag' },
  { key: 'offer', label: 'Offer', icon: 'fa-percent' },
];

export default function AddNewModal() {
  const { isOpen, activeTab, setActiveTab, editing, close } = useModal();
  const branchesCtx = useBranches();
  const itemsCtx = useItems();
  const employeesCtx = useEmployees();
  const customersCtx = useCustomers();
  const pricingCtx = usePricing();
  const offersCtx = useOffers();

  if (!isOpen) return null;

  const isEditing = !!editing;
  const currentTab = isEditing ? editing.type : activeTab;

  // كل تاب بيحدد: تاب العنوان، الفورم اللي هيترسم، ودالة الـ submit المناسبة
  // (لو بنعدل، بننادي update بتاعت الـ Context، لو بنضيف، بننادي add)
  function getTabConfig(tabKey) {
    switch (tabKey) {
      case 'branch':
        return {
          title: 'Branch',
          Form: BranchForm,
          onSubmit: (data) => isEditing ? branchesCtx.updateBranch(editing.data.id, data) : branchesCtx.addBranch(data),
        };
      case 'item':
        return {
          title: 'Item',
          Form: ItemForm,
          onSubmit: (data) => isEditing ? itemsCtx.updateItem(editing.data.id, data) : itemsCtx.addItem(data),
        };
      case 'employee':
        return {
          title: 'Employee',
          Form: EmployeeForm,
          onSubmit: (data) => isEditing ? employeesCtx.updateEmployee(editing.data.id, data) : employeesCtx.addEmployee(data),
        };
      case 'customer':
        return {
          title: 'Customer',
          Form: CustomerForm,
          onSubmit: (data) => isEditing ? customersCtx.updateCustomer(editing.data.id, data) : customersCtx.addCustomer(data),
        };
      case 'price':
        return {
          title: 'Price',
          Form: PricingForm,
          onSubmit: (data) => isEditing ? pricingCtx.updatePricingItem(editing.data.id, data) : pricingCtx.addPricingItem(data),
        };
      case 'offer':
        return {
          title: 'Offer',
          Form: OfferForm,
          onSubmit: (data) => isEditing ? offersCtx.updateOffer(editing.data.id, data) : offersCtx.addOffer(data),
        };
      default:
        return null;
    }
  }

  const config = getTabConfig(currentTab);

  async function handleSubmit(data) {
    await config.onSubmit(data);
    close();
  }
  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-dialog modal-dialog-centered bg-light p-2 rounded-3" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 p-2">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">{isEditing ? `Edit ${config.title}` : 'Add New'}</h5>
            <button type="button" className="btn-close" onClick={close}></button>
          </div>

          {/* التابز بتظهر بس لما بنضيف - في وضع التعديل النوع محدد أصلاً */}
          {!isEditing && (
            <div className="d-flex gap-2 px-3 pb-3 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`entity-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                </button>
              ))}
            </div>
          )}

          <config.Form
            initialData={editing?.data || null}
            onSubmit={handleSubmit}
            onCancel={close}
            submitLabel={isEditing ? 'Save Changes' : `Add ${config.title}`}
          />
        </div>
      </div>
    </div>
  );
}
