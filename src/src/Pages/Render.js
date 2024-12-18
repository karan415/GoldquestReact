import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../Sidebar/SidebarContext';
import MainContent from './MainContent';

const Render = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <MainContent />
      </div>
      <Outlet />
    </SidebarProvider>
  );
};

export default Render;
