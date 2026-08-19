import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Branches from './pages/Branches';
import Store from './pages/Store';
import Employees from './pages/Employees';
import Customers from './pages/Customers';
import Pricing from './pages/Pricing';
import Offers from './pages/Offers';

// كل "صفحة" في المشروع القديم (index.html, branches.html, ...) بقت "route"
// جوه تطبيق واحد. الميزة: السايدبار (Layout) بيترسم مرة واحدة بس، ومش بيعمل
// reload كامل للصفحة كل ما تنقلي بين الأقسام - ده أسرع وده أساسًا سبب وجود React Router
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/store" element={<Store />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/offers" element={<Offers />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
