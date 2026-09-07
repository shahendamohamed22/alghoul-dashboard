import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Branches from './pages/Branches';
import BranchDetail from './pages/BranchDetail';
import Store from './pages/Store';
import Employees from './pages/Employees';
import Customers from './pages/Customers';
import Pricing from './pages/Pricing';
import Offers from './pages/Offers';
import Products from './pages/Products';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* /login is public - it's outside ProtectedRoute so it doesn't get stuck in a redirect loop */}
        <Route path="/login" element={<Login />} />

        {/* Everything else requires a valid token */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/branches/:id" element={<BranchDetail />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/products" element={<Products />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;