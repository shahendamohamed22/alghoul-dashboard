import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import { ModalProvider } from './context/ModalContext'
import { BranchesProvider } from './context/BranchesContext'
import { EmployeesProvider } from './context/EmployeesContext'
import { CustomersProvider } from './context/CustomersContext'
import { PricingProvider } from './context/PricingContext'
import { OffersProvider } from './context/OffersContext'
import { ProductsProvider } from './context/ProductsContext'
import { CategoriesProvider } from './context/CategoriesContext'
import { BrandsProvider } from './context/BrandsContext'
import { InventoryProvider } from './context/InventoryContext'


// كل Provider بيلف اللي بعده - الترتيب مش مهم هنا لأن الـ contexts دي
// مش معتمدة على بعض، كل واحد مستقل بذاته
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <BranchesProvider>
          <EmployeesProvider>
            <CustomersProvider>
              <PricingProvider>
                <OffersProvider>
                  <CategoriesProvider>
                    <BrandsProvider>
                      <ProductsProvider>
                        <InventoryProvider>
                          <App />
                        </InventoryProvider>
                      </ProductsProvider>
                    </BrandsProvider>
                  </CategoriesProvider>
                </OffersProvider>
              </PricingProvider>
            </CustomersProvider>
          </EmployeesProvider>
        </BranchesProvider>
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
)
