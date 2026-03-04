import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockTenants, mockUsers, Tenant, User, VM, UserRole } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  tenants: Tenant[];
  setTenants: (tenants: Tenant[]) => void;
  activeTenantId: string;
  setActiveTenantId: (id: string) => void;
  activeTenant: Tenant | undefined;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  selectedVM: VM | null;
  setSelectedVM: (vm: VM | null) => void;
  showVMDrawer: boolean;
  setShowVMDrawer: (show: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  deleteTarget: { type: string; name: string; onConfirm: () => void } | null;
  setDeleteTarget: (target: { type: string; name: string; onConfirm: () => void } | null) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant-1');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedVM, setSelectedVM] = useState<VM | null>(null);
  const [showVMDrawer, setShowVMDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; name: string; onConfirm: () => void } | null>(null);

  const activeTenant = tenants.find(t => t.id === activeTenantId);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      tenants, setTenants,
      activeTenantId, setActiveTenantId,
      activeTenant,
      toasts, addToast, removeToast,
      selectedVM, setSelectedVM,
      showVMDrawer, setShowVMDrawer,
      showDeleteModal, setShowDeleteModal,
      deleteTarget, setDeleteTarget,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
