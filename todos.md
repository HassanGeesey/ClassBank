# Class Bank — Task Checklist

## Module 0: Project Scaffold
- [ ] Init Vite + React + TS
- [ ] Install dependencies
- [ ] Configure Tailwind CSS
- [ ] Configure PWA
- [ ] Set up React Router
- [ ] Create folder structure
- [ ] Set up Supabase client (`src/lib/supabase.ts`)
- [ ] Define TypeScript types (`src/lib/types.ts`)
- [ ] Create shared utils (`src/lib/utils.ts`)
- [ ] Build UI primitives (Button, Card, Table, Modal, Input)
- [ ] Build layout components (AppShell, Sidebar, Header)

## Module 1: Database Schema + RLS
- [ ] `001_profiles.sql` — profiles table
- [ ] `002_classes.sql` — classes table
- [ ] `003_class_admins.sql` — class_admins table
- [ ] `004_contributions.sql` — contributions table
- [ ] `005_expenses.sql` — expenses table
- [ ] `006_activity_logs.sql` — activity_logs table
- [ ] `007_rls.sql` — all RLS policies

## Module 2: Auth Feature
- [ ] Create `AuthContext`
- [ ] Implement `signIn` / `signOut`
- [ ] `LoginPage`
- [ ] `PasswordChangePage`
- [ ] `ProtectedRoute` + role guards
- [ ] Wire into router

## Module 3: Classes Feature
- [ ] `ClassListPage` (super_admin)
- [ ] `ClassForm` (create/edit)
- [ ] `ClassDetailPage`
- [ ] `AssignAdminsModal`
- [ ] `useClasses` hook with queries

## Module 4: Students Feature
- [ ] `StudentListPage` with search/filter
- [ ] `StudentForm` (create/edit)
- [ ] `StudentImport` (CSV)
- [ ] `useStudents` hook

## Module 5: Contributions Feature
- [ ] `ContributionForm`
- [ ] `ContributionListPage`
- [ ] Computed totals (SQL)
- [ ] `useContributions` hook

## Module 6: Expenses Feature
- [ ] `ExpenseForm`
- [ ] `ExpenseListPage`
- [ ] Computed totals (SQL)
- [ ] `useExpenses` hook

## Module 7: Dashboard Feature
- [ ] `DashboardPage` layout
- [ ] `StatCard` components
- [ ] `PaymentStatusTable`
- [ ] `useDashboard` hook
- [ ] Role-filtered data

## Module 8: Reports Feature
- [ ] `ReportsPage`
- [ ] `PDFGenerator` — contribution summary
- [ ] `PDFGenerator` — expense summary
- [ ] `PDFGenerator` — student status

## Module 9: PWA Polish
- [ ] Offline support config
- [ ] App icons
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Responsive refinements
- [ ] Performance audit
