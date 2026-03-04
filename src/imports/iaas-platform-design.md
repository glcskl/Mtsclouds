Сгенерируй дизайн-систему и макеты (Desktop-first) для веб-приложения “IaaS Platform (MVP)”, где пользователи управляют виртуальными машинами (в демо это Docker-контейнеры), есть мультитенантность, квоты ресурсов и роли.

Цели дизайна:
- Профессиональный enterprise-кабинет (телеком/облако), чистый, строгий, “как админка”.
- Максимальная читаемость данных (таблицы, квоты, статусы, графики).
- Единый UI для двух зон: Platform Admin и Tenant Area.
- Подготовить: стили, переменные, компоненты (с вариантами), 8–10 экранов, состояния ошибок/пустых данных/загрузки.

Форм-фактор:
- Основной: Desktop 1440 × 900 (safe area 1200–1280).
- Дополнительно: адаптивная логика для 1280 и 1024 (без отдельной мобильной версии).

Стиль/настроение:
- Enterprise, нейтральные цвета, много “воздуха”, акцентный цвет сдержанный.
- Скругления умеренные, тени мягкие. Визуально близко к современным SaaS админкам (Stripe/Cloudflare/Linear style, но без копирования).

Design tokens (создай Figma Variables + Styles):
Цвета (Light theme):
- Primary: #3B82F6 (hover #2563EB, pressed #1D4ED8)
- Neutrals:
  - Background: #F8FAFC
  - Surface: #FFFFFF
  - Surface-2: #F1F5F9
  - Border: #E2E8F0
  - Text-primary: #0F172A
  - Text-secondary: #475569
  - Text-muted: #94A3B8
- Semantic:
  - Success: #16A34A
  - Warning: #F59E0B
  - Danger: #DC2626
  - Info: #0EA5E9
- Chart palette (не яркая): вариации синих/фиолетовых/зелёных на основе primary + semantic.

Типографика:
- Font: Inter (если недоступно — system UI).
- H1 28/36 Semibold
- H2 22/30 Semibold
- H3 18/26 Semibold
- Body 14/20 Regular
- Small 12/16 Regular
- Mono: JetBrains Mono 12/16 для команд/ID.
- Принципы: заголовки короткие, в таблицах и карточках Body/Small.

Сетка и отступы:
- 12-column grid, margin 80, gutter 24 (для 1440).
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Радиусы: 12 для карточек, 10 для модалок, 8 для инпутов/кнопок.
- Тени: 2 уровня (card / dropdown).

Иконки:
- Используй стиль “stroke icons” (Lucide-like). Размеры 16/20.

Компоненты (создай как Components + Variants + Auto Layout):
1) App Shell
- Sidebar (ширина 264) + Topbar (56) + Content.
- Sidebar items: default/hover/active/disabled, с иконкой и бейджем (опционально).
- Topbar: breadcrumbs, поиск (опционально), профиль пользователя, роль, кнопка выхода.

2) Buttons
- Primary / Secondary / Tertiary / Danger
- Размеры: sm (32), md (40), lg (48)
- States: default/hover/pressed/disabled/loading (spinner слева).

3) Inputs
- Text input, password, select, textarea, search
- States: default/focus/error/disabled
- Helper text + error text.

4) Table
- Header + sortable columns + row hover + row actions menu (kebab).
- Empty state inside table (icon + text + CTA).
- Pagination footer.

5) Cards
- Metric card (value + label + delta).
- Resource card (title, status badge, meta lines, actions).

6) Badges/Tags
- Status badge: RUNNING (success), STOPPED (neutral), ERROR (danger), CREATING (info), DELETING (warning).
- Role badge: Platform Admin / Tenant Admin / User.

7) Quota & Progress
- Progress bar (тонкий) + label “Used / Allocated / Limit”.
- Donut small widget (optional) for CPU/RAM.

8) Modal / Drawer
- Confirm modal (delete)
- Form modal (create VM)
- Side drawer for VM details.

9) Toast notifications
- success/info/warning/error.

10) Charts
- Line chart for CPU% and RAM MB over time
- Mini sparkline in table row (optional).

Сущности и словарь (используй в копирайтинге):
- Tenant = Организация
- VDC = Виртуальный дата-центр
- VM = Виртуальная машина (в демо контейнер)
- Quotas = Квоты
- Allocated = Выделено
- Used = Используется
- Limit = Лимит
- Templates = Шаблоны образов
- Provider = Провайдер (Docker)

Навигация (две зоны):
A) Platform Admin area (админ платформы)
- Overview
- Tenants (Организации)
- Infrastructure (Инфраструктура)
- Audit Log (опционально)

B) Tenant area (кабинет организации)
- Dashboard
- VMs (ВМ)
- Templates (Шаблоны)
- Users (опционально)
- Billing (опционально)

Экраны (создай отдельные Frames, 1440×900, и прототипные связи):
1) Login
- Логотип/название, email, пароль, кнопка “Войти”.
- Demo helper: “Войти как: Platform Admin / Tenant Admin A / Tenant Admin B” (маленькие кнопки).

2) Platform Admin — Overview
- Cards: Total Tenants, Total VMs, Allocated CPU/RAM, Alerts.
- Chart: infra usage (line or stacked bar).
- Table: Recent activity (audit-like).

3) Platform Admin — Tenants list
- Таблица: Organization, VDC, Quota CPU/RAM/Disk/VMs, Allocated, Status, Actions (View/Edit/Disable).
- CTA: “Создать организацию”.

4) Platform Admin — Tenant details
- Header: Organization name + status + actions (Edit quotas).
- Section: VDC quotas widget (progress bars).
- Section: VM list (read-only) с фильтром по статусу.

5) Platform Admin — Create/Edit Tenant (modal or page)
- Form: Name, VDC name, Quotas (CPU cores, RAM GB, Disk GB, VM count), Save.
- Validation errors.

6) Tenant — Dashboard
- Квоты: 3–4 карточки (CPU/RAM/Disk/VM count) с Used/Allocated/Limit.
- Quick actions: “Create VM”, “View templates”.
- Table: Recent VMs (name, template, status, cpu/ram/disk, updated, actions).

7) Tenant — VMs list
- Таблица с фильтрами (status, template) + поиск.
- Row actions: Start, Stop, Resize, Delete, Open details.
- Empty state: “Нет ВМ” + CTA “Создать ВМ”.

8) Tenant — Create VM wizard (page or modal)
- Step 1: Template selection (cards with template name, description, default ресурсы).
- Step 2: Configure resources (CPU cores, RAM GB, Disk GB), показывай “остаток квоты”.
- Step 3: Review & Create.
- Error case: “Quota exceeded” с подсветкой, предложи уменьшить ресурсы.

9) Tenant — VM Details (drawer or page)
- Header: VM name + status badge + provider + VM ID (mono).
- Actions: Start/Stop/Resize/Delete.
- Tabs: Overview (ресурсы, сеть, uptime), Metrics (charts CPU/RAM), Logs (optional placeholder).
- Show “SSH command” блок (mono) для шаблона ubuntu-sshd: ssh user@vm-host -p 2222 (пример).

10) Shared — Delete confirm modal
- Текст: “Удалить VM ‘web-01’? Действие необратимо.”
- Buttons: Cancel / Delete (danger).

Состояния (создай отдельные примеры/варианты):
- Loading: skeleton для таблиц и карточек.
- Empty: для VM list, templates.
- Error: toast + inline error in forms.
- Access denied page (если роль не совпадает) — минимальный экран.

Контент (пример данных, чтобы макеты выглядели живыми):
Tenants: “Acme Telecom”, “Beta Retail”, “Gamma Labs”
VDC: “acme-vdc”
VMs: web-01 (nginx), worker-02 (ubuntu-sshd), cache-01 (redis)
Quotas пример:
- CPU limit 16 cores, allocated 10, used 6
- RAM limit 64 GB, allocated 40, used 22
- Disk limit 500 GB, allocated 220, used 180
- VM count limit 20, allocated 6, used 6

Требования к структуре Figma:
- Создай страницы: “00-Foundations”, “01-Components”, “02-Flows (Admin)”, “03-Flows (Tenant)”.
- В “Foundations” сделай: color styles, text styles, effect styles, spacing notes.
- Все компоненты с Auto Layout и понятными naming conventions:
  - Color/Primary/500, Text/H2, Button/Primary/md, Table/Row, Badge/Status/Running.
- Используй variants, а не дубликаты фреймов.

Вывод:
Сделай полностью готовый дизайн: визуально единый, аккуратный, с компонентами и 8–10 экранов выше, включая состояния. Создай прототипные связи между ключевыми экранами (Login → Admin Overview / Tenant Dashboard, навигация по сайдбару, Create VM modal, VM details drawer).