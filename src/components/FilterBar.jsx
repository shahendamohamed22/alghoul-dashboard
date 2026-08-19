// ده كان أكبر تكرار في المشروع الأصلي: كل صفحة (store.js, employees.js, customers.js,
// pricing.js) كانت بتكرر نفس المنطق بالظبط - primaryFilter + secondaryFilter + دالة
// بترسم أزرار الفلتر الفرعي وتربطها بـ event listener. في React، المنطق ده كله بيبقى
// "declarative": إنتي بس بتقوليله "دي الخيارات المتاحة دلوقتي" وهو بيرسمها، مفيش
// addEventListener يدوي ولا innerHTML.
export default function FilterBar({
  primaryOptions,       // [{ value: 'all', label: 'All Items' }, ...]
  primaryFilter,
  onPrimaryChange,
  secondaryOptions = [], // array بسيطة من strings، أو [] لو مفيش فلتر فرعي دلوقتي
  secondaryFilter,
  onSecondaryChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div className="mb-3">
        <div className="d-flex gap-2 mb-2 flex-wrap">
          {primaryOptions.map((opt) => (
            <button
              key={opt.value}
              className={`filter-btn btn btn-success${primaryFilter === opt.value ? ' active' : ''}`}
              onClick={() => onPrimaryChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {secondaryOptions.length > 0 && (
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`filter-btn-sub${secondaryFilter === 'all' ? ' active' : ''}`}
              onClick={() => onSecondaryChange('all')}
            >
              All
            </button>
            {secondaryOptions.map((opt) => (
              <button
                key={opt}
                className={`filter-btn-sub${secondaryFilter === opt ? ' active' : ''}`}
                onClick={() => onSecondaryChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="d-flex gap-2">
        <div className="position-relative">
          <i
            className="fa-solid fa-magnifying-glass position-absolute text-muted"
            style={{ left: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}
          ></i>
          <input
            type="text"
            className="form-control ps-4"
            style={{ minWidth: 220 }}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
