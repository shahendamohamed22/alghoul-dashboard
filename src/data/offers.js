export const offers = [
  { id: 1, title: 'عرض الصيف الكبير', description: 'خصم موسمي على مستلزمات الصيف', type: 'percentage', value: 25, totalPrice: 45, productsCount: 3, requestsCount: 150, startDate: '2025-06-01', endDate: '2025-06-30' },
  { id: 2, title: 'باقة الإفطار', description: 'باقة متكاملة لوجبة الإفطار', type: 'package', value: 25, totalPrice: 25, productsCount: 3, requestsCount: 90, startDate: '2025-07-01', endDate: '2025-07-15' },
  { id: 3, title: 'عرض المجمدات', description: 'خصم على كل المنتجات المجمدة', type: 'percentage', value: 30, totalPrice: 60, productsCount: 4, requestsCount: 310, startDate: '2025-05-01', endDate: '2025-05-31' },
  { id: 4, title: 'باقة المخبوزات', description: 'باقة يومية من المخبوزات الطازة', type: 'package', value: 35, totalPrice: 35, productsCount: 4, requestsCount: 220, startDate: '2025-05-15', endDate: '2025-06-15' },
  { id: 5, title: 'باقة العائلة', description: 'باقة أساسيات شهرية للعائلة', type: 'package', value: 50, totalPrice: 50, productsCount: 6, requestsCount: 130, startDate: '2025-04-01', endDate: '2025-04-30' },
  { id: 6, title: 'عرض الشتاء', description: 'خصم على منتجات فصل الشتاء', type: 'percentage', value: 15, totalPrice: 30, productsCount: 2, requestsCount: 60, startDate: '2025-01-01', endDate: '2025-01-31' },
  { id: 7, title: 'خصم اللحوم', description: 'خصم أسبوعي على اللحوم الطازة', type: 'percentage', value: 20, totalPrice: 40, productsCount: 2, requestsCount: 45, startDate: '2025-02-01', endDate: '2025-02-15' },
  { id: 8, title: 'عرض نهاية الأسبوع', description: 'خصم سريع لآخر الأسبوع', type: 'percentage', value: 10, totalPrice: 20, productsCount: 1, requestsCount: 30, startDate: '2025-03-01', endDate: '2025-03-07' },
];

// بتحسب حالة العرض (نشط/منتهي/قادم) بمقارنة تاريخ اليوم بتواريخ البداية والنهاية
export function getOfferStatus(offer) {
  const today = new Date().toISOString().slice(0, 10);
  if (today < offer.startDate) return 'قادم';
  if (today > offer.endDate) return 'منتهي';
  return 'نشط';
}