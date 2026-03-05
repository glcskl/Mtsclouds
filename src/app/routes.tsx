import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TariffPlansPage from './pages/TariffPlansPage';
import CapacityForecastPage from './pages/CapacityForecastPage';
import CostCalculatorPage from './pages/CostCalculatorPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import TenantsListPage from './pages/admin/TenantsListPage';
import TenantDetailsPage from './pages/admin/TenantDetailsPage';
import CreateTenantPage from './pages/admin/CreateTenantPage';
import InfrastructurePage from './pages/admin/InfrastructurePage';
import AuditLogPage from './pages/admin/AuditLogPage';
import TenantDashboardPage from './pages/tenant/TenantDashboardPage';
import VMsListPage from './pages/tenant/VMsListPage';
import CreateVMPage from './pages/tenant/CreateVMPage';
import TemplatesPage from './pages/tenant/TemplatesPage';
import UsersPage from './pages/tenant/UsersPage';
import BillingPage from './pages/tenant/BillingPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import { useApp } from './context/AppContext';

function RouteLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="flex items-center gap-2 text-[#94A3B8] text-[13px]">
        <Loader2 size={16} className="animate-spin" />
        Загрузка...
      </div>
    </div>
  );
}

function RequirePlatformAdmin({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useApp();
  if (loading) return <RouteLoading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'platform_admin') return <Navigate to="/403" replace />;
  return <>{children}</>;
}

function RequireTenantUser({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useApp();
  if (loading) return <RouteLoading />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'platform_admin') return <Navigate to="/403" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/tariffs', Component: TariffPlansPage },
  { path: '/forecast', Component: CapacityForecastPage },
  { path: '/calculator', Component: CostCalculatorPage },
  { path: '/403', Component: AccessDeniedPage },

  // Platform Admin
  {
    path: '/admin/overview',
    Component: () => (
      <RequirePlatformAdmin>
        <AdminOverviewPage />
      </RequirePlatformAdmin>
    ),
  },
  {
    path: '/admin/tenants',
    Component: () => (
      <RequirePlatformAdmin>
        <TenantsListPage />
      </RequirePlatformAdmin>
    ),
  },
  {
    path: '/admin/tenants/new',
    Component: () => (
      <RequirePlatformAdmin>
        <CreateTenantPage />
      </RequirePlatformAdmin>
    ),
  },
  {
    path: '/admin/tenants/:id',
    Component: () => (
      <RequirePlatformAdmin>
        <TenantDetailsPage />
      </RequirePlatformAdmin>
    ),
  },
  {
    path: '/admin/tenants/:id/edit',
    Component: () => (
      <RequirePlatformAdmin>
        <CreateTenantPage />
      </RequirePlatformAdmin>
    ),
  },
  {
    path: '/admin/infrastructure',
    Component: () => (
      <RequirePlatformAdmin>
        <InfrastructurePage />
      </RequirePlatformAdmin>
    ),
  },
  {
    path: '/admin/audit',
    Component: () => (
      <RequirePlatformAdmin>
        <AuditLogPage />
      </RequirePlatformAdmin>
    ),
  },

  // Tenant area
  {
    path: '/tenant/dashboard',
    Component: () => (
      <RequireTenantUser>
        <TenantDashboardPage />
      </RequireTenantUser>
    ),
  },
  {
    path: '/tenant/vms',
    Component: () => (
      <RequireTenantUser>
        <VMsListPage />
      </RequireTenantUser>
    ),
  },
  {
    path: '/tenant/vms/new',
    Component: () => (
      <RequireTenantUser>
        <CreateVMPage />
      </RequireTenantUser>
    ),
  },
  {
    path: '/tenant/templates',
    Component: () => (
      <RequireTenantUser>
        <TemplatesPage />
      </RequireTenantUser>
    ),
  },

  {
    path: '/tenant/users',
    Component: () => (
      <RequireTenantUser>
        <UsersPage />
      </RequireTenantUser>
    ),
  },
  {
    path: '/tenant/billing',
    Component: () => (
      <RequireTenantUser>
        <BillingPage />
      </RequireTenantUser>
    ),
  },
]);
