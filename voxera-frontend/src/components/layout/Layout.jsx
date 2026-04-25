import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
        <aside className="hidden lg:block w-72 shrink-0">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}