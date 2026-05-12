import { Outlet } from 'react-router-dom';

import { Sidebar } from '@widgets/sidebar';

export const MainLayout = () => {
  return (
    <div className="flex bg-[#f6f7f9] text-[#101828]">
      <Sidebar />
      <main className="max-h-screen flex-1 overflow-auto">
        <div className="flex min-h-screen flex-col px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
