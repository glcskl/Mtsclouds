import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { VMDetailsDrawer } from './pages/tenant/VMDetailsDrawer';

function AppWithDrawer() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <VMDetailsDrawer />
    </AppProvider>
  );
}

export default AppWithDrawer;
