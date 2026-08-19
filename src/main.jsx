import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { ModalProvider } from './context/ModalContext'
import { BranchesProvider } from './context/BranchesContext'
import { ItemsProvider } from './context/ItemsContext'
import { EmployeesProvider } from './context/EmployeesContext'
import { CustomersProvider } from './context/CustomersContext'
import { PricingProvider } from './context/PricingContext'

// كل Provider بيلف اللي بعده - الترتيب مش مهم هنا لأن الـ contexts دي
// مش معتمدة على بعض، كل واحد مستقل بذاته
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalProvider>
      <BranchesProvider>
        <ItemsProvider>
          <EmployeesProvider>
            <CustomersProvider>
              <PricingProvider>
                <App />
              </PricingProvider>
            </CustomersProvider>
          </EmployeesProvider>
        </ItemsProvider>
      </BranchesProvider>
    </ModalProvider>
  </StrictMode>,
)
