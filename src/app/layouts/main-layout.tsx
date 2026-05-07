import { Outlet } from 'react-router-dom';

import { Sidebar } from '@widgets/sidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen flex bg-[#f6f7f9] text-[#101828]">
      <Sidebar />
      <main className="min-h-screen">
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
