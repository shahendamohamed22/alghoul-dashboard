export const products = [
  { id: 1, name: 'موز طازج', description: 'موز طازج عالي الجودة', category: 'Produce', brand: 'FreshCo', purchasePrice: 2.50, sellingPrice: 4.50, discount: 0, unitType: 'kg', weight: 1.5, rating: 4.8, status: 'active' },
  { id: 2, name: 'حليب كامل الدسم', description: 'حليب طازج كامل الدسم', category: 'Dairy', brand: 'DairyBest', purchasePrice: 3.80, sellingPrice: 6.20, discount: 10, unitType: 'liter', weight: 1, rating: 4.5, status: 'active' },
  { id: 3, name: 'لحم مفروم اكجم', description: 'لحم بقري طازج مفروم', category: 'Meat', brand: 'PrimeMeat', purchasePrice: 8.00, sellingPrice: 12.00, discount: 5, unitType: 'kg', weight: 1, rating: 4.9, status: 'inactive' },
  { id: 4, name: 'خبز سوردو', description: 'خبز سوردو طازج مخبوز يوميًا', category: 'Bakery', brand: 'GoldenBake', purchasePrice: 2.80, sellingPrice: 5.30, discount: 0, unitType: 'piece', weight: 0.5, rating: 4.3, status: 'active' },
  { id: 5, name: 'عصير برتقال الطر', description: 'عصير برتقال طبيعي 100%', category: 'Beverages', brand: 'SunFresh', purchasePrice: 4.50, sellingPrice: 7.80, discount: 15, unitType: 'liter', weight: 1, rating: 4.1, status: 'active' },
];

export const productCategories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Frozen', 'Other'];
export const productBrands = ['FreshCo', 'DairyBest', 'PrimeMeat', 'GoldenBake', 'SunFresh', 'Other'];
export const unitTypes = [
  { value: 'kg', label: 'كيلو (Kg)' },
  { value: 'g', label: 'جرام (g)' },
  { value: 'liter', label: 'لتر (L)' },
  { value: 'piece', label: 'قطعة' },
];

export const productCategoryColors = {
  Produce: 'success', Dairy: 'primary', Meat: 'danger', Bakery: 'warning',
  Beverages: 'info', Frozen: 'dark', Other: 'secondary',
};

export function getFinalPrice(p) {
  return p.sellingPrice - (p.sellingPrice * (p.discount || 0)) / 100;
}