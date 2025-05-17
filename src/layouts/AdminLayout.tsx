
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-sanjer-gray">
      <AdminSidebar />
      
      <main className="ml-64 flex-1 flex flex-col">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sanjer-blue"></div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
