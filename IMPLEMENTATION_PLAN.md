# Class Contribution Transparency PWA — Implementation Plan

## Architecture

### Feature-Based Modular Structure

```
class-bank/
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql
│       ├── 002_classes.sql
│       ├── 003_class_admins.sql
│       ├── 004_contributions.sql
│       ├── 005_expenses.sql
│       ├── 006_activity_logs.sql
│       └── 007_rls.sql
├── src/
│   ├── features/           # Self-contained feature modules
│   │   ├── auth/           # Login, context, guards, password change
│   │   ├── classes/        # CRUD classes, assign admins
│   │   ├── students/       # CRUD students, CSV import, search/filter
│   │   ├── contributions/  # Record & view contributions
│   │   ├── expenses/       # Record & view expenses
│   │   ├── dashboard/      # Role-based computed dashboard
│   │   └── reports/        # PDF export
│   ├── components/
│   │   ├── ui/             # Shared primitives (Button, Card, Table, Modal, Input)
│   │   └── layout/         # AppShell, Sidebar, Header
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client singleton
│   │   ├── types.ts        # TypeScript types mirroring DB schema
│   │   └── utils.ts        # Shared utilities (cn, formatCurrency, etc.)
│   ├── hooks/              # Shared hooks
│   │   └── useAuth.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── manifest.json
│   └── icons/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── IMPLEMENTATION_PLAN.md
└── todos.md
```

---

## Tech Stack

| Layer          | Choice                          |
|----------------|---------------------------------|
| Frontend       | React 18 + TypeScript + Vite    |
| Styling        | Tailwind CSS v3                 |
| PWA            | vite-plugin-pwa                 |
| Backend/Auth   | Supabase (Auth + PostgreSQL)    |
| State          | React Context + hooks           |
| PDF            | jsPDF + html2canvas             |

---

## Auth Design

- **Supabase Auth** with auto-generated email (`{student_id}@classbank.local`)
- **`profiles`** table stores: `id` (FK→auth.users), `student_id`, `name`, `role`, `class_id`
- `student_id` is the primary user-facing login identifier
- App translates `student_id` → email before calling Supabase Auth
- No self-registration; accounts created by Admin/Super Admin

---

## Phases & Modules

### Module 0: Project Scaffold
**Dependencies:** None  
**Files:** `package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `src/lib/supabase.ts`, `src/lib/types.ts`, `src/App.tsx`, `src/main.tsx`, `public/manifest.json`  
**Tasks:**
- [ ] Init Vite + React + TS project
- [ ] Install deps: tailwindcss, supabase-js, vite-plugin-pwa, react-router-dom, lucide-react, jsPDF, html2canvas
- [ ] Configure Tailwind
- [ ] Configure PWA (manifest, service worker)
- [ ] Configure React Router
- [ ] Create folder structure
- [ ] Set up Supabase client
- [ ] Define TypeScript types

---

### Module 1: Database Schema + RLS
**Dependencies:** Module 0  
**Files:** `supabase/migrations/001_profiles.sql` through `007_rls.sql`  
**Tasks:**
- [ ] `001_profiles.sql` — profiles table with FK to auth.users, role enum
- [ ] `002_classes.sql` — classes table
- [ ] `003_class_admins.sql` — class_admins join table
- [ ] `004_contributions.sql` — contributions table
- [ ] `005_expenses.sql` — expenses table
- [ ] `006_activity_logs.sql` — activity_logs table (optional)
- [ ] `007_rls.sql` — All RLS policies

**Schema details:**

```sql
-- Role enum
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'student');

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id  TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'student',
  class_id    UUID REFERENCES classes(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Admins (join table)
CREATE TABLE class_admins (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id  UUID REFERENCES classes(id) ON DELETE CASCADE,
  admin_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(class_id, admin_id)
);

-- Contributions
CREATE TABLE contributions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by    UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Principles:**
- `super_admin` — full access on all tables
- `admin` — read/write on own class data only
- `student` — read own profile, read own contributions, read class dashboard

---

### Module 2: Auth Feature
**Dependencies:** Module 1  
**Files:** `src/features/auth/AuthContext.tsx`, `src/features/auth/LoginPage.tsx`, `src/features/auth/PasswordChangePage.tsx`, `src/features/auth/ProtectedRoute.tsx`, `src/features/auth/useAuth.ts`  
**Tasks:**
- [ ] Create AuthContext (React Context)
- [ ] Implement `signIn(student_id, password)` — translates to email, calls Supabase Auth
- [ ] Implement `signOut`
- [ ] Create LoginPage with student_id + password form
- [ ] Create PasswordChangePage
- [ ] Create ProtectedRoute component with role-based guards
- [ ] Wire into App.tsx router

---

### Module 3: Classes Feature
**Dependencies:** Modules 1, 2  
**Files:** `src/features/classes/` — `ClassListPage.tsx`, `ClassForm.tsx`, `ClassDetailPage.tsx`, `AssignAdminsModal.tsx`, `useClasses.ts`  
**Tasks:**
- [ ] Super Admin: list all classes
- [ ] Super Admin: create/edit/delete class
- [ ] Super Admin: assign/remove admins to class
- [ ] Admin: view assigned class only
- [ ] Class picker/dropdown for context

---

### Module 4: Students Feature
**Dependencies:** Modules 1, 2, 3  
**Files:** `src/features/students/` — `StudentListPage.tsx`, `StudentForm.tsx`, `StudentImport.tsx`, `useStudents.ts`  
**Tasks:**
- [ ] List students with search/filter
- [ ] Create student (creates auth user + profile)
- [ ] Edit student details
- [ ] Delete student
- [ ] CSV import (columns: student_id, name, password)
- [ ] Bulk create from CSV

---

### Module 5: Contributions Feature
**Dependencies:** Modules 1, 2, 4  
**Files:** `src/features/contributions/` — `ContributionListPage.tsx`, `ContributionForm.tsx`, `useContributions.ts`  
**Tasks:**
- [ ] Record contribution (student_id, amount, date)
- [ ] List contributions with filters
- [ ] Per-student contribution history
- [ ] Computed: total per student, class total (SQL, never stored)

---

### Module 6: Expenses Feature
**Dependencies:** Modules 1, 2, 3  
**Files:** `src/features/expenses/` — `ExpenseListPage.tsx`, `ExpenseForm.tsx`, `useExpenses.ts`  
**Tasks:**
- [ ] Record expense (description, amount, date)
- [ ] List expenses with filters
- [ ] Computed: total expenses (SQL, never stored)

---

### Module 7: Dashboard Feature
**Dependencies:** Modules 5, 6  
**Files:** `src/features/dashboard/` — `DashboardPage.tsx`, `StatCard.tsx`, `PaymentStatusTable.tsx`, `useDashboard.ts`  
**Tasks:**
- [ ] Total contributions card
- [ ] Total expenses card
- [ ] Remaining balance card
- [ ] Paid / partial / unpaid student breakdown (SQL-computed)
- [ ] Role-filtered data (super_admin = all, admin = own class, student = own)

---

### Module 8: Reports Feature
**Dependencies:** Modules 5, 6  
**Files:** `src/features/reports/` — `ReportsPage.tsx`, `PDFGenerator.ts`  
**Tasks:**
- [ ] Contribution summary PDF
- [ ] Expense summary PDF
- [ ] Student payment status PDF
- [ ] Download button per report type

---

### Module 9: PWA Polish
**Dependencies:** All modules complete  
**Files:** `vite.config.ts` (PWA updates), `public/manifest.json`, service worker config  
**Tasks:**
- [ ] Configure offline support
- [ ] Add app icons (generated)
- [ ] Loading skeletons for all pages
- [ ] Error boundaries
- [ ] Responsive refinements
- [ ] Performance audit

---

## Core Constraints (from AGENTS.md)

| Rule | Enforcement |
|------|-------------|
| Never store computed values | All status/totals/balance derived via SQL queries |
| Every record includes `class_id` | FK on contributions, expenses; profiles link via FK |
| RLS is sole security layer | No middleware/API checks; policies on every table |
| Roles enforced via DB | `super_admin` / `admin` / `student` enum in profiles |

---

## Git Workflow

1. **Phase commits** — one commit per module after completion
2. **Branch strategy** — `main` (stable), feature branches if collaborating
3. **Commit style** — Conventional Commits (`feat:`, `fix:`, `chore:`)
