import { createContext, useContext, useState } from 'react';
import { products as initialProducts } from '../data/products';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);

  function addProduct(data) {
    setProducts((prev) => [...prev, { id: Date.now(), ...data }]);
  }

  function updateProduct(id, data) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const value = { products, addProduct, updateProduct, deleteProduct };
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}