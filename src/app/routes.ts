import { createBrowserRouter, redirect } from 'react-router';
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
import AccessDeniedPage from './pages/AccessDeniedPage';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/tariffs', Component: TariffPlansPage },
  { path: '/forecast', Component: CapacityForecastPage },
  { path: '/calculator', Component: CostCalculatorPage },
  { path: '/403', Component: AccessDeniedPage },

  // Platform Admin
  { path: '/admin/overview', Component: AdminOverviewPage },
  { path: '/admin/tenants', Component: TenantsListPage },
  { path: '/admin/tenants/new', Component: CreateTenantPage },
  { path: '/admin/tenants/:id', Component: TenantDetailsPage },
  { path: '/admin/tenants/:id/edit', Component: CreateTenantPage },
  { path: '/admin/infrastructure', Component: InfrastructurePage },
  { path: '/admin/audit', Component: AuditLogPage },

  // Tenant area
  { path: '/tenant/dashboard', Component: TenantDashboardPage },
  { path: '/tenant/vms', Component: VMsListPage },
  { path: '/tenant/vms/new', Component: CreateVMPage },
  { path: '/tenant/templates', Component: TemplatesPage },

  // Placeholder routes
  { path: '/tenant/users', Component: AccessDeniedPage },
  { path: '/tenant/billing', Component: AccessDeniedPage },
]);