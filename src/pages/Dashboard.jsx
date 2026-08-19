import ChartCanvas from '../components/ChartCanvas';
import Legend from '../components/Legend';
import { useBranches } from '../context/BranchesContext';


// كل الداتا الثابتة (categoryData, topBranches...) بتتحط برا الـ component
// - مش جوه الـ function body. لو حطيناها جوه، React هيعيد إنشاءها من الصفر
// كل مرة الـ component يعمل render، وده مش محتاجينه هنا لأنها بيانات ثابتة.
const categoryData = [
  { name: 'Produce', value: 28, color: '#16342c' },
  { name: 'Dairy', value: 18, color: '#1f6b4d' },
  { name: 'Meat', value: 22, color: '#3d9970' },
  { name: 'Bakery', value: 12, color: '#7fc79e' },
  { name: 'Beverages', value: 14, color: '#b8e0c8' },
  { name: 'Other', value: 6, color: '#e5f0ea' },
];

const topBranches = [
  { rank: 1, name: 'Downtown', revenue: 18420 },
  { rank: 2, name: 'Westside', revenue: 16890 },
  { rank: 3, name: 'Northgate', revenue: 15230 },
];

const recentActivity = [
  { text: 'New order #4821 at Downtown', amount: '$142.50' },
  { text: 'Low stock alert at Westside', amount: null },
  { text: 'New customer registered', amount: null },
];

const todayOverview = [
  { icon: 'fa-store', label: 'Open Branches', value: '11 / 11' },
  { icon: 'fa-bag-shopping', label: "Today's Orders", value: '312' },
  { icon: 'fa-triangle-exclamation', label: 'Active Alerts', value: '3' },
];

const revenueChartConfig = {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Revenue',
      fill: true,
      data: [12000, 15000, 14000, 17000, 21000, 22000, 21500],
      borderColor: '#1f6b4d',
      backgroundColor: 'rgba(31, 107, 77, 0.1)',
      tension: 0.4,
    }],
  },
  options: { plugins: { legend: { display: false } } },
};

const categoryChartConfig = {
  type: 'doughnut',
  data: {
    labels: categoryData.map((c) => c.name),
    datasets: [{
      data: categoryData.map((c) => c.value),
      backgroundColor: categoryData.map((c) => c.color),
    }],
  },
  options: {
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { display: false } },
  },
};

export default function Dashboard() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="h3 fw-bold mb-0">Dashboard</h1>
          <div className="text-muted small">Overview of all branches</div>
        </div>
        <div className="text-muted small">June 21, 2026</div>
      </div>

      <div className="row">
        <div className="col-6 col-lg-3">
          <div className="border border-1 rounded-3 shadow p-2">
            <div className="d-flex justify-content-between align-items-center">
              <i className="fa-solid fa-dollar-sign fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
              <span className="bg-brand-light py-1 px-2 rounded-4 text-brand-green">
                <i className="fa-solid fa-arrow-trend-up"></i> +8.2%
              </span>
            </div>
            <h3 className="fs-1">$124,580</h3>
            <p className="text-secondary fs-6">Total Revenue</p>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="border border-1 rounded-3 shadow p-2">
            <div className="d-flex justify-content-between align-items-center">
              <i className="fa-solid fa-bag-shopping fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
              <span className="bg-brand-light py-1 px-2 rounded-4 text-brand-green">
                <i className="fa-solid fa-arrow-trend-up"></i> +12.1%
              </span>
            </div>
            <h3 className="fs-1">3,247</h3>
            <p className="text-secondary fs-6">Total Orders</p>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="border border-1 rounded-3 shadow p-2">
            <div className="d-flex justify-content-between align-items-center">
              <i className="fa-solid fa-users fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
              <span className="bg-brand-light py-1 px-2 rounded-4 text-brand-green">
                <i className="fa-solid fa-arrow-trend-up"></i> +5.3%
              </span>
            </div>
            <h3 className="fs-1">1,892</h3>
            <p className="text-secondary fs-6">Active Customers</p>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="border border-1 rounded-3 shadow p-2">
            <div className="d-flex justify-content-between align-items-center">
              <i className="fa-solid fa-credit-card fa-lg style-icon p-4 bg-brand-light text-brand-green"></i>
              <span className="bg-danger-subtle py-1 px-2 rounded-4 text-danger">
                <i className="fa-solid fa-arrow-trend-down"></i> -2.1%
              </span>
            </div>
            <h3 className="fs-1">$38.40</h3>
            <p className="text-secondary fs-6">Avg Order Value</p>
          </div>
        </div>
      </div>

      <div className="row mt-5 align-items-center">
        <div className="col-lg-7">
          <div className="revenueChart w-100 border border-1 rounded-4 p-3 shadow h-100">
            <ChartCanvas config={revenueChartConfig} />
          </div>
        </div>

        <div className="col-lg-5">
          <div className="d-flex align-items-center justify-content-center gap-3 w-100 border border-1 rounded-4 p-4 shadow h-100 flex-wrap">
            <div style={{ width: 140, height: 140 }}>
              <ChartCanvas config={categoryChartConfig} />
            </div>
            <Legend items={categoryData} />
          </div>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-4">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Top Performing Branches</h6>
            <ul className="list-unstyled mb-0">
              {topBranches.map((b) => (
                <li key={b.rank} className="d-flex justify-content-between align-items-center mb-3">
                  <span className="d-flex align-items-center gap-2">
                    <span
                      className="bg-brand-light text-brand-green rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                      style={{ width: 26, height: 26, fontSize: 12 }}
                    >
                      {b.rank}
                    </span>
                    <span className="small">{b.name}</span>
                  </span>
                  <span className="fw-semibold small">${b.revenue.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Recent Activity</h6>
            <ul className="list-unstyled mb-0">
              {recentActivity.map((item, i) => (
                <li key={i} className="d-flex align-items-start gap-2 mb-3 small">
                  <span className="bg-brand-green rounded-circle d-inline-block mt-1" style={{ width: 6, height: 6 }}></span>
                  <span>
                    {item.text}
                    {item.amount && <> — <strong>{item.amount}</strong></>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="bg-white border rounded-4 p-3 h-100">
            <h6 className="fw-bold mb-3">Today's Overview</h6>
            <ul className="list-unstyled mb-0">
              {todayOverview.map((item) => (
                <li key={item.label} className="d-flex justify-content-between align-items-center mb-3 small">
                  <span className="d-flex align-items-center gap-2 text-muted">
                    <i className={`fa-solid ${item.icon}`}></i> {item.label}
                  </span>
                  <span className="fw-semibold">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
