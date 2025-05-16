
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-sanjer-gray">
      <AdminSidebar />
      
      <main className="ml-64 flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
