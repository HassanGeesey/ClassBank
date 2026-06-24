# Class Contribution Transparency System — PRD (Lean)

## Overview

A PWA for managing class contributions and expenses with full transparency.

Students view payment status and class finances.
Admins manage contributions, expenses, and students.
Super Admin manages classes and admin assignments.

---

## Tech Stack

- Frontend: React + Vite + PWA
- Backend: Supabase
- Database: PostgreSQL
- Hosting: Vercel

---

## Roles

### Super Admin

- Manage classes (CRUD)
- Manage admins (CRUD)
- Manage students (CRUD)
- Assign admins to classes
- View all data

### Admin

- Manage assigned class only
- Manage students
- Record contributions
- Record expenses
- Generate reports

### Student

- View personal payment status
- View class dashboard
- Change password

---

## Authentication

- Login: Student ID + Password
- No self-registration
- Accounts created by Admin/Super Admin
- Password change allowed after login

---

## Core Features

### Class Management

- Create classes
- Assign admins per class

### Student Management

- CSV import (student_id, name, password)
- CRUD students
- Search/filter students

### Contributions

Store:

- student_id
- amount
- date
- recorded_by

System calculates:

- total contributions
- outstanding balance
- payment status (computed, not stored)

### Expenses

Store:

- description
- amount
- date
- added_by

System calculates:

- total expenses
- remaining balance

---

## Dashboard

Role-based real-time dashboard:

- total contributions
- total expenses
- remaining balance
- paid / partial / unpaid students
- class financial summary

---

## Reports

- PDF export:
  - contributions summary
  - expenses summary
  - student payment status

---

## Database Schema

### users

- id
- student_id
- name
- password_hash
- role (super_admin | admin | student)
- class_id
- created_at

### classes

- id
- name
- created_at

### class_admins

- id
- class_id
- admin_id

### contributions

- id
- student_id
- class_id
- amount
- date
- recorded_by

### expenses

- id
- class_id
- description
- amount
- date
- added_by

### activity_logs (optional)

- id
- user_id
- action
- timestamp

---

## Security

- Supabase Auth or custom ID auth
- Row Level Security (RLS)
- Role-Based Access Control (RBAC)
- Class-level data isolation
- Password hashing required

---

## Performance

- Dashboard load < 2s
- Works on low bandwidth
- Supports 100+ students per class
- Minimal API calls

---

## UI/UX

- Banking-style clean dashboard
- Minimal, modern UI
- Mobile-first PWA

Pages:

- Login
- Dashboard
- Students
- Contributions
- Expenses
- Reports
- Settings

---

## MVP Phases

### Phase 1

- Auth
- Class system
- Student import
- Contributions
- Basic dashboard

### Phase 2

- Expenses
- PDF reports
- RLS security

### Phase 3

- Optimization
- UI improvements
