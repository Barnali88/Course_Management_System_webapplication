import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const TopGlow = () => (
  <>
    <div className="absolute top-0 right-0 w-[34rem] h-[34rem] bg-fuchsia-600/12 blur-3xl rounded-full pointer-events-none" />
    <div className="absolute top-24 left-16 w-[26rem] h-[26rem] bg-brand-600/10 blur-3xl rounded-full pointer-events-none" />
  </>
);

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="h-screen bg-[#070b14] text-slate-100 relative overflow-hidden">
      <TopGlow />

      <div className="relative z-10 flex h-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          <div className="px-4 md:px-8 py-5 md:py-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;