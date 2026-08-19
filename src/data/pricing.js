export const pricingItems = [
  { name: 'Fresh Bananas', category: 'Produce', purchase: 0.45, selling: 0.89, vendor: 'Tropical Farms', updated: '2026-06-15' },
  { name: 'Whole Milk 1gal', category: 'Dairy', purchase: 2.80, selling: 3.99, vendor: 'Dairyland Co', updated: '2026-06-18' },
  { name: 'Ground Beef 1lb', category: 'Meat', purchase: 4.50, selling: 6.99, vendor: 'Prime Cuts', updated: '2026-06-10' },
  { name: 'Sourdough Bread', category: 'Bakery', purchase: 1.80, selling: 3.49, vendor: 'Artisan Bakes', updated: '2026-06-20' },
  { name: 'Orange Juice 64oz', category: 'Beverages', purchase: 3.20, selling: 4.79, vendor: 'Citrus Fresh', updated: '2026-06-12' },
  { name: 'Red Apples', category: 'Produce', purchase: 0.95, selling: 1.69, vendor: 'Orchard Valley', updated: '2026-06-14' },
  { name: 'Cheddar Cheese', category: 'Dairy', purchase: 3.40, selling: 5.29, vendor: 'Dairyland Co', updated: '2026-06-16' },
  { name: 'Chicken Breast 1lb', category: 'Meat', purchase: 3.80, selling: 5.99, vendor: 'Poultry Plus', updated: '2026-06-19' },
  { name: 'Croissants 4pk', category: 'Bakery', purchase: 2.40, selling: 4.49, vendor: 'Artisan Bakes', updated: '2026-06-17' },
  { name: 'Sparkling Water 12pk', category: 'Beverages', purchase: 4.20, selling: 6.99, vendor: 'Clear Springs', updated: '2026-06-11' }
];

// دالة الحساب اتنقلت هنا كـ helper، عشان أي component يحتاجها يستوردها بدل ما نكررها
export function calcMargin(item) {
  return ((item.selling - item.purchase) / item.selling) * 100;
}
