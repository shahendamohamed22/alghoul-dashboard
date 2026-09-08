import { useState, useEffect } from 'react';
import { useCategories } from '../../context/CategoriesContext';
import { useBrands } from '../../context/BrandsContext';
import { useProducts, unitTypeMap, weightUnitMap, normalizeEnum } from '../../context/ProductsContext';

const emptyForm = {
  name: '', description: '', sellingPrice: '', purchasePrice: '',
  discountPercentage: '', unitType: 1, weight: '', weightUnit: 1,
  categoryId: '', brandId: '',
};

export default function ProductForm({ initialData, onSubmit, onCancel, submitLabel }) {
  const { flatCategories, addCategory } = useCategories();
  const { brands, addBrand } = useBrands();
  const { fetchProductById } = useProducts();

  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  useEffect(() => {
    if (initialData?.id) {
      // The list row doesn't carry everything we need for the form, so we
      // fetch the full product record before pre-filling
      fetchProductById(initialData.id).then((full) => {
        const category = flatCategories.find((c) => c.name === full.categoryName);
        const brand = brands.find((b) => b.name === full.brandName);
        setForm({
          name: full.name || '',
          description: full.description || '',
          sellingPrice: full.sellingPrice ?? '',
          purchasePrice: '', // not returned by the API - see note above the code
          discountPercentage: full.discountPercentage ?? '',
          unitType: normalizeEnum(unitTypeMap, full.unitType) || 1,
          weight: full.weight ?? '',
          weightUnit: normalizeEnum(weightUnitMap, full.weightUnit) || 1,
          categoryId: category?.id || '',
          brandId: brand?.id || '',
        });
        setExistingImages(full.images);
      });
    } else {
      setForm(emptyForm);
      setExistingImages([]);
    }
    setImagesToDelete([]);
    setNewImages([]);
  }, [initialData]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleDeleteImage(imgId) {
    setImagesToDelete((prev) => prev.includes(imgId) ? prev.filter((id) => id !== imgId) : [...prev, imgId]);
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    await addCategory({ name: newCategoryName });
    setNewCategoryName('');
    setShowNewCategory(false);
  }

  async function handleAddBrand() {
    if (!newBrandName.trim()) return;
    await addBrand(newBrandName);
    setNewBrandName('');
    setShowNewBrand(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      images: newImages,
      imageIdsToDelete: imagesToDelete,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body pt-0" style={{ maxHeight: 480, overflowY: 'auto' }}>
        <div className="mb-3">
          <label className="form-label small">اسم المنتج *</label>
          <input className="form-control" name="name" placeholder="مثل: موز طازج" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label small">الوصف</label>
          <textarea className="form-control" name="description" rows="2" value={form.description} onChange={handleChange}></textarea>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">سعر الشراء *</label>
            <input type="number" min="0" step="0.01" className="form-control" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} required />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">سعر البيع *</label>
            <input type="number" min="0" step="0.01" className="form-control" name="sellingPrice" value={form.sellingPrice} onChange={handleChange} required />
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">نسبة الخصم (%)</label>
            <input type="number" min="0" max="100" className="form-control" name="discountPercentage" value={form.discountPercentage} onChange={handleChange} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">نوع الوحدة *</label>
            <select className="form-select" name="unitType" value={form.unitType} onChange={handleChange} required>
              {Object.entries(unitTypeMap).map(([label, val]) => <option key={label} value={val}>{label}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small">الوزن</label>
            <input type="number" min="0" step="0.01" className="form-control" name="weight" value={form.weight} onChange={handleChange} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small">وحدة الوزن</label>
            <select className="form-select" name="weightUnit" value={form.weightUnit} onChange={handleChange}>
              {Object.entries(weightUnitMap).map(([label, val]) => <option key={label} value={val}>{label}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label small mb-0">التصنيف *</label>
            <span className="text-brand-green small" role="button" onClick={() => setShowNewCategory(!showNewCategory)}>+ تصنيف جديد</span>
          </div>
          <select className="form-select" name="categoryId" value={form.categoryId} onChange={handleChange} required>
            <option value="">اختر التصنيف</option>
            {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {showNewCategory && (
            <div className="d-flex gap-2 mt-2">
              <input className="form-control form-control-sm" placeholder="اسم التصنيف الجديد" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
              <button type="button" className="btn btn-sm bg-brand-dark text-white" onClick={handleAddCategory}>إضافة</button>
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label small mb-0">البراند</label>
            <span className="text-brand-green small" role="button" onClick={() => setShowNewBrand(!showNewBrand)}>+ براند جديد</span>
          </div>
          <select className="form-select" name="brandId" value={form.brandId} onChange={handleChange}>
            <option value="">اختر البراند (اختياري)</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {showNewBrand && (
            <div className="d-flex gap-2 mt-2">
              <input className="form-control form-control-sm" placeholder="اسم البراند الجديد" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
              <button type="button" className="btn btn-sm bg-brand-dark text-white" onClick={handleAddBrand}>إضافة</button>
            </div>
          )}
        </div>

        {existingImages.length > 0 && (
          <div className="mb-3">
            <label className="form-label small">الصور الحالية (فك التحديد لحذف الصورة)</label>
            <div className="d-flex gap-2 flex-wrap">
              {existingImages.map((img) => (
                <div key={img.id} className="position-relative">
                  <img src={img.url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', opacity: imagesToDelete.includes(img.id) ? 0.3 : 1 }} className="rounded-3 border" />
                  <input
                    type="checkbox"
                    className="position-absolute top-0 end-0 m-1"
                    checked={!imagesToDelete.includes(img.id)}
                    onChange={() => toggleDeleteImage(img.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label small">إضافة صور جديدة</label>
          <input type="file" accept="image/*" multiple className="form-control" onChange={(e) => setNewImages(Array.from(e.target.files))} />
        </div>
      </div>
      <div className="modal-footer border-0">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit" className="btn bg-brand-dark text-white">{submitLabel}</button>
      </div>
    </form>
  );
}