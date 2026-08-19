# FreshCart Admin (React)

نسخة React من مشروع FreshCart Admin Dashboard - محولة من HTML/Bootstrap/Vanilla JS.

## التشغيل

```bash
npm install
npm run dev
```

هيفتح على `http://localhost:5173`

## البناء للإنتاج

```bash
npm run build
```

النتيجة هتطلع في مجلد `dist/`.

## للتفاصيل الكاملة عن التحويل

اقرأي `NOTES.md` - فيه شرح كل قرار اتاخد أثناء التحويل من الكود القديم لـ React، وليه، بالتفصيل.

## بنية المشروع

```
src/
  data/          بيانات كل صفحة (branches, items, employees, customers, pricing)
  components/    Sidebar, Layout, FilterBar, StatCard, ChartCanvas, Legend
  pages/         Dashboard, Branches, Store, Employees, Customers, Pricing
  App.jsx        الـ Router
  index.css      الاستايل + إصلاح الـ RWD بتاع السايدبار
```

## المكتبات المستخدمة

- React 19 + Vite
- react-router-dom (التنقل بين الصفحات)
- chart.js (الشارتات)
- Bootstrap 5 + Font Awesome 6 (عن طريق CDN، زي المشروع الأصلي)
