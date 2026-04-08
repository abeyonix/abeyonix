const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-xl font-bold">120</h2>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-xl font-bold">85</h2>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500">Revenue</p>
          <h2 className="text-xl font-bold">₹1,20,000</h2>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;