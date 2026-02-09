import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-12 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
