// نفس نمط الـ "ارسمي ul من array" اللي كان بيتكرر يدوي (CategoryLegend, stockValueLegend,
// scheduleLegend, priceTierLegend...) - هنا بقى component واحد بياخد data وشكل (layout)
// ويرسم نفس الشكل. لو عاوزة تضيفي شارت جديد وليجند تحته، استخدمي ده بدل ما تكرري الكود.
export default function Legend({ items, layout = 'column' }) {
  const wrapperClass =
    layout === 'row'
      ? 'list-unstyled d-flex flex-wrap gap-3 mt-3 mb-0 small'
      : 'mb-0';

  return (
    <ul className={wrapperClass}>
      {items.map((item) => (
        <li key={item.name} className="d-flex justify-content-between align-items-center mb-2 gap-3">
          <span className="d-flex align-items-center gap-2">
            <span
              className="rounded-circle d-inline-block"
              style={{ width: 8, height: 8, background: item.color }}
            ></span>
            {item.name}
          </span>
          {item.value !== undefined && <span className="text-muted">{item.value}%</span>}
        </li>
      ))}
    </ul>
  );
}
