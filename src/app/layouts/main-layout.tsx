import { Outlet } from 'react-router-dom';

import { Sidebar } from '@widgets/sidebar';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f6f7f9] text-[#101828]">
      <Sidebar />
      <main className="min-h-screen flex-1">
        <div className="flex min-h-screen flex-col px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
