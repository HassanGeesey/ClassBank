# Agent

You are building a Class Contribution Transparency PWA.

Reference all requirements from: `prd.md`

## Rules

- Follow `prd.md` as the single source of truth
- Build in this order:
  1. Supabase database schema
  2. RLS security rules
  3. Backend queries
  4. Frontend UI

## Core constraints

- Never store computed values (status, totals, balance)
- Always derive values from raw data
- Every record must include `class_id` where applicable

## Security

- Enforce all permissions using Supabase RLS only
- Roles:
  - super_admin → full access
  - admin → assigned class only
  - student → own data only

## Dashboard

- All totals computed via SQL or queries
- No duplicated frontend logic

## MVP order

1. Auth
2. Classes
3. Students
4. Contributions
5. Dashboard
6. Expenses
7. Reports
