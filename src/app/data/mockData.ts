export type VMStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'CREATING' | 'DELETING';
export type TenantStatus = 'ACTIVE' | 'DISABLED';
export type UserRole = 'platform_admin' | 'tenant_admin' | 'user';

export interface VM {
  id: string;
  name: string;
  template: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  disk: number;
  ip: string;
  uptime: string;
  createdAt: string;
  updatedAt: string;
  provider: string;
  port?: number;
}

export interface Quota {
  cpu: { limit: number; allocated: number; used: number };
  ram: { limit: number; allocated: number; used: number };
  disk: { limit: number; allocated: number; used: number };
  vms: { limit: number; allocated: number; used: number };
}

export interface Tenant {
  id: string;
  name: string;
  vdc: string;
  status: TenantStatus;
  quota: Quota;
  vms: VM[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant?: string;
}

export const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Acme Telecom',
    vdc: 'acme-vdc',
    status: 'ACTIVE',
    createdAt: '2024-01-15',
    quota: {
      cpu: { limit: 16, allocated: 10, used: 6 },
      ram: { limit: 64, allocated: 40, used: 22 },
      disk: { limit: 500, allocated: 220, used: 180 },
      vms: { limit: 20, allocated: 6, used: 6 },
    },
    vms: [
      {
        id: 'vm-001',
        name: 'web-01',
        template: 'nginx:latest',
        status: 'RUNNING',
        cpu: 2,
        ram: 4,
        disk: 20,
        ip: '10.0.1.10',
        uptime: '14d 3h 22m',
        createdAt: '2024-02-01',
        updatedAt: '2024-03-04T10:22:00Z',
        provider: 'Docker',
        port: 80,
      },
      {
        id: 'vm-002',
        name: 'worker-02',
        template: 'ubuntu-sshd:22.04',
        status: 'RUNNING',
        cpu: 2,
        ram: 8,
        disk: 40,
        ip: '10.0.1.11',
        uptime: '5d 11h 04m',
        createdAt: '2024-02-20',
        updatedAt: '2024-03-03T08:14:00Z',
        provider: 'Docker',
        port: 2222,
      },
      {
        id: 'vm-003',
        name: 'cache-01',
        template: 'redis:7-alpine',
        status: 'RUNNING',
        cpu: 1,
        ram: 2,
        disk: 10,
        ip: '10.0.1.12',
        uptime: '30d 0h 12m',
        createdAt: '2024-01-20',
        updatedAt: '2024-03-04T09:00:00Z',
        provider: 'Docker',
        port: 6379,
      },
      {
        id: 'vm-004',
        name: 'db-01',
        template: 'postgres:15',
        status: 'STOPPED',
        cpu: 2,
        ram: 8,
        disk: 60,
        ip: '10.0.1.13',
        uptime: '—',
        createdAt: '2024-02-10',
        updatedAt: '2024-03-02T15:30:00Z',
        provider: 'Docker',
        port: 5432,
      },
      {
        id: 'vm-005',
        name: 'monitor-01',
        template: 'grafana/grafana:latest',
        status: 'ERROR',
        cpu: 1,
        ram: 2,
        disk: 10,
        ip: '10.0.1.14',
        uptime: '—',
        createdAt: '2024-02-28',
        updatedAt: '2024-03-04T06:45:00Z',
        provider: 'Docker',
        port: 3000,
      },
      {
        id: 'vm-006',
        name: 'api-gw-01',
        template: 'nginx:latest',
        status: 'CREATING',
        cpu: 2,
        ram: 4,
        disk: 20,
        ip: '—',
        uptime: '—',
        createdAt: '2024-03-04',
        updatedAt: '2024-03-04T11:00:00Z',
        provider: 'Docker',
      },
    ],
  },
  {
    id: 'tenant-2',
    name: 'Beta Retail',
    vdc: 'beta-vdc',
    status: 'ACTIVE',
    createdAt: '2024-02-01',
    quota: {
      cpu: { limit: 8, allocated: 4, used: 2 },
      ram: { limit: 32, allocated: 16, used: 8 },
      disk: { limit: 200, allocated: 80, used: 45 },
      vms: { limit: 10, allocated: 3, used: 3 },
    },
    vms: [
      {
        id: 'vm-101',
        name: 'shop-web',
        template: 'nginx:latest',
        status: 'RUNNING',
        cpu: 1,
        ram: 2,
        disk: 15,
        ip: '10.0.2.10',
        uptime: '10d 4h',
        createdAt: '2024-02-15',
        updatedAt: '2024-03-04T08:00:00Z',
        provider: 'Docker',
        port: 80,
      },
      {
        id: 'vm-102',
        name: 'shop-db',
        template: 'postgres:15',
        status: 'RUNNING',
        cpu: 2,
        ram: 4,
        disk: 40,
        ip: '10.0.2.11',
        uptime: '10d 4h',
        createdAt: '2024-02-15',
        updatedAt: '2024-03-04T08:00:00Z',
        provider: 'Docker',
        port: 5432,
      },
      {
        id: 'vm-103',
        name: 'shop-cache',
        template: 'redis:7-alpine',
        status: 'STOPPED',
        cpu: 1,
        ram: 2,
        disk: 10,
        ip: '10.0.2.12',
        uptime: '—',
        createdAt: '2024-02-20',
        updatedAt: '2024-03-03T14:00:00Z',
        provider: 'Docker',
        port: 6379,
      },
    ],
  },
  {
    id: 'tenant-3',
    name: 'Gamma Labs',
    vdc: 'gamma-vdc',
    status: 'DISABLED',
    createdAt: '2024-02-15',
    quota: {
      cpu: { limit: 32, allocated: 0, used: 0 },
      ram: { limit: 128, allocated: 0, used: 0 },
      disk: { limit: 1000, allocated: 0, used: 0 },
      vms: { limit: 50, allocated: 0, used: 0 },
    },
    vms: [],
  },
];

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Alex Petrov', email: 'admin@platform.io', role: 'platform_admin' },
  { id: 'u-2', name: 'Maria Ivanova', email: 'admin@acme.io', role: 'tenant_admin', tenant: 'tenant-1' },
  { id: 'u-3', name: 'Ivan Sidorov', email: 'admin@beta.io', role: 'tenant_admin', tenant: 'tenant-2' },
];

export const auditLog = [
  { id: 'a-1', user: 'Maria Ivanova', action: 'VM создана', target: 'api-gw-01', tenant: 'Acme Telecom', time: '2024-03-04T11:00:00Z', level: 'info' },
  { id: 'a-2', user: 'Alex Petrov', action: 'Квота изменена', target: 'Acme Telecom', tenant: 'Platform', time: '2024-03-04T10:30:00Z', level: 'warning' },
  { id: 'a-3', user: 'Maria Ivanova', action: 'VM остановлена', target: 'db-01', tenant: 'Acme Telecom', time: '2024-03-02T15:30:00Z', level: 'info' },
  { id: 'a-4', user: 'Ivan Sidorov', action: 'VM остановлена', target: 'shop-cache', tenant: 'Beta Retail', time: '2024-03-03T14:00:00Z', level: 'info' },
  { id: 'a-5', user: 'Alex Petrov', action: 'Организация отключена', target: 'Gamma Labs', tenant: 'Platform', time: '2024-02-28T09:00:00Z', level: 'danger' },
  { id: 'a-6', user: 'Maria Ivanova', action: 'VM запущена', target: 'web-01', tenant: 'Acme Telecom', time: '2024-02-18T08:00:00Z', level: 'info' },
];

export const cpuChartData = [
  { time: '00:00', acme: 42, beta: 18, gamma: 0 },
  { time: '02:00', acme: 38, beta: 20, gamma: 0 },
  { time: '04:00', acme: 35, beta: 15, gamma: 0 },
  { time: '06:00', acme: 40, beta: 16, gamma: 0 },
  { time: '08:00', acme: 55, beta: 22, gamma: 0 },
  { time: '10:00', acme: 72, beta: 30, gamma: 0 },
  { time: '12:00', acme: 68, beta: 28, gamma: 0 },
  { time: '14:00', acme: 65, beta: 25, gamma: 0 },
  { time: '16:00', acme: 70, beta: 29, gamma: 0 },
  { time: '18:00', acme: 60, beta: 24, gamma: 0 },
  { time: '20:00', acme: 52, beta: 20, gamma: 0 },
  { time: '22:00', acme: 48, beta: 19, gamma: 0 },
];

export const vmMetricsData = [
  { time: '00:00', cpu: 12, ram: 1200 },
  { time: '02:00', cpu: 8, ram: 1150 },
  { time: '04:00', cpu: 6, ram: 1100 },
  { time: '06:00', cpu: 10, ram: 1200 },
  { time: '08:00', cpu: 24, ram: 1400 },
  { time: '10:00', cpu: 45, ram: 1800 },
  { time: '12:00', cpu: 52, ram: 2100 },
  { time: '14:00', cpu: 48, ram: 2000 },
  { time: '16:00', cpu: 55, ram: 2200 },
  { time: '18:00', cpu: 40, ram: 1900 },
  { time: '20:00', cpu: 30, ram: 1700 },
  { time: '22:00', cpu: 18, ram: 1500 },
];

export const templates = [
  {
    id: 'tpl-1',
    name: 'Ubuntu 22.04 SSH',
    image: 'ubuntu-sshd:22.04',
    description: 'Базовая Ubuntu с SSH-доступом. Подходит для разработки и тестирования.',
    defaultCpu: 2,
    defaultRam: 4,
    defaultDisk: 20,
    category: 'OS',
  },
  {
    id: 'tpl-2',
    name: 'Nginx Web Server',
    image: 'nginx:latest',
    description: 'Высокопроизводительный веб-сервер и обратный прокси.',
    defaultCpu: 1,
    defaultRam: 1,
    defaultDisk: 10,
    category: 'Web',
  },
  {
    id: 'tpl-3',
    name: 'PostgreSQL 15',
    image: 'postgres:15',
    description: 'Реляционная СУБД с поддержкой JSON, индексов и репликации.',
    defaultCpu: 2,
    defaultRam: 4,
    defaultDisk: 40,
    category: 'Database',
  },
  {
    id: 'tpl-4',
    name: 'Redis 7 Alpine',
    image: 'redis:7-alpine',
    description: 'Быстрое in-memory хранилище для кэша и очередей.',
    defaultCpu: 1,
    defaultRam: 1,
    defaultDisk: 5,
    category: 'Cache',
  },
  {
    id: 'tpl-5',
    name: 'Grafana Monitoring',
    image: 'grafana/grafana:latest',
    description: 'Платформа визуализации метрик и алертинга.',
    defaultCpu: 1,
    defaultRam: 2,
    defaultDisk: 10,
    category: 'Monitoring',
  },
  {
    id: 'tpl-6',
    name: 'Node.js 20 LTS',
    image: 'node:20-alpine',
    description: 'Среда выполнения JavaScript для серверных приложений.',
    defaultCpu: 2,
    defaultRam: 2,
    defaultDisk: 15,
    category: 'Runtime',
  },
];

// Тарифные планы
export interface TariffPlan {
  id: string;
  name: string;
  description: string;
  price: number; // руб/месяц
  cpu: number;
  ram: number; // GB
  disk: number; // GB
  vms: number;
  bandwidth: number; // Mbit/s
  support: string;
  features: string[];
  popular?: boolean;
}

export const tariffPlans: TariffPlan[] = [
  {
    id: 'tariff-starter',
    name: 'Starter',
    description: 'Для небольших проектов и тестирования',
    price: 2990,
    cpu: 4,
    ram: 8,
    disk: 100,
    vms: 5,
    bandwidth: 100,
    support: 'Email',
    features: [
      '4 vCPU ядра',
      '8 GB RAM',
      '100 GB SSD',
      'До 5 виртуальных машин',
      '100 Mbit/s канал',
      'Email поддержка',
      'Базовый мониторинг',
    ],
  },
  {
    id: 'tariff-business',
    name: 'Business',
    description: 'Оптимальный для бизнес-приложений',
    price: 7990,
    cpu: 16,
    ram: 32,
    disk: 500,
    vms: 20,
    bandwidth: 500,
    support: '24/7 Chat',
    features: [
      '16 vCPU ядер',
      '32 GB RAM',
      '500 GB SSD',
      'До 20 виртуальных машин',
      '500 Mbit/s канал',
      '24/7 онлайн-чат',
      'Расширенный мониторинг',
      'Еженедельные бэкапы',
    ],
    popular: true,
  },
  {
    id: 'tariff-enterprise',
    name: 'Enterprise',
    description: 'Для высоконагруженных систем',
    price: 19990,
    cpu: 64,
    ram: 128,
    disk: 2000,
    vms: 100,
    bandwidth: 1000,
    support: '24/7 Phone',
    features: [
      '64 vCPU ядра',
      '128 GB RAM',
      '2 TB SSD',
      'До 100 виртуальных машин',
      '1 Gbit/s канал',
      '24/7 телефонная поддержка',
      'Персональный менеджер',
      'Ежедневные бэкапы',
      'SLA 99.95%',
      'Dedicated инфраструктура',
    ],
  },
  {
    id: 'tariff-custom',
    name: 'Custom',
    description: 'Индивидуальное решение под ваши задачи',
    price: 0,
    cpu: 0,
    ram: 0,
    disk: 0,
    vms: 0,
    bandwidth: 0,
    support: 'Dedicated',
    features: [
      'Кастомные конфигурации',
      'Неограниченные ресурсы',
      'Выделенное оборудование',
      'Индивидуальные SLA',
      'Персональная команда поддержки',
      'Консультации архитектора',
      'Миграция инфраструктуры',
    ],
  },
];

// Данные для AI прогнозирования
export const workloadTypes = [
  { id: 'web-app', name: 'Веб-приложение', baseCpu: 2, baseRam: 4, baseDisk: 20 },
  { id: 'api-service', name: 'API сервис', baseCpu: 4, baseRam: 8, baseDisk: 40 },
  { id: 'database', name: 'База данных', baseCpu: 4, baseRam: 16, baseDisk: 100 },
  { id: 'ml-training', name: 'ML обучение', baseCpu: 16, baseRam: 64, baseDisk: 200 },
  { id: 'data-analytics', name: 'Аналитика данных', baseCpu: 8, baseRam: 32, baseDisk: 500 },
  { id: 'microservices', name: 'Микросервисы', baseCpu: 12, baseRam: 24, baseDisk: 100 },
];

export const userLoadLevels = [
  { id: 'low', name: 'Низкая (до 1K)', multiplier: 1 },
  { id: 'medium', name: 'Средняя (1K-10K)', multiplier: 2 },
  { id: 'high', name: 'Высокая (10K-100K)', multiplier: 4 },
  { id: 'extreme', name: 'Экстремальная (100K+)', multiplier: 8 },
];

// Прайс лист (руб/час)
export const pricing = {
  cpu: 5, // за 1 vCPU
  ram: 3, // за 1 GB
  disk: 0.5, // за 1 GB SSD
  bandwidth: 2, // за 1 Mbit/s
};