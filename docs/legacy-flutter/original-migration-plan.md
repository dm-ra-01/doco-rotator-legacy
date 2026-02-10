---
sidebar_position: 5
---

# Original Migration Plan

:::warning Historical Document
This document represents the **original migration plan** created at the start of the Flutter → Next.js transition. Many aspects have been superseded by the [Core Suite Strategy](https://docs.commonbond.au/receptor/docs/app-documentation/architecture). It is preserved for historical reference.
:::

---

## Original Strategy: Strangler Pattern

The original plan proposed a **Route-Based Strangler Pattern** using a reverse proxy to gradually replace Flutter routes with Next.js equivalents.

### Planned Phases

| Phase | Goal | Status |
|:------|:-----|:-------|
| **Phase 1**: Auth | Migrate login/signup to Next.js | ✅ Complete |
| **Phase 2**: Shell | Build main app shell and dashboard | ✅ Complete (3 apps) |
| **Phase 3**: Org & Workers | Migrate worker management | 🟡 In Progress |
| **Phase 4**: Allocation | Migrate allocation planner | ✅ Complete |
| **Phase 5**: Shutdown | Decommission Flutter | 🔴 Pending |

---

## What Changed: Core Suite Strategy

The original plan assumed a **single Next.js application** would replace Flutter. Instead, we adopted a **Core Suite Strategy**:

| Original Plan | Actual Implementation |
|:--------------|:----------------------|
| Single monolithic Next.js app | Four specialized components |
| shadcn/ui + Tailwind | Vanilla CSS for management apps |
| TanStack Table everywhere | Custom components per app |
| Zustand for state | React hooks + Context |
| Next.js 14 | Next.js 15 (App Router) |

### The Four Components

1. **Workforce** ([workforce-frontend](https://github.com/dm-ra-01/workforce-frontend)) — Organizational master data
2. **Planner** ([planner-frontend](https://github.com/dm-ra-01/planner-frontend)) — Allocation plan management
3. **Preferencer** ([preference-frontend](https://github.com/dm-ra-01/preference-frontend)) — Worker-facing preference submission
4. **Allocator** ([match-backend](https://github.com/dm-ra-01/match-backend)) — Intelligent matching engine

---

## Original Module Breakdown

This was the original priority order for migration:

### Priority 1: Core / Foundation ✅
- Authentication ✅
- App Shell ✅
- Global State ✅
- Base UI Components ✅

### Priority 2: Organisation Management 🟡
- Org/Location Context ✅
- Team & Position Management ✅
- Workers List 🔴

### Priority 3: Worker Operations 🔴
- Onboarding ✅ (Preferencer)
- Worker Profile & Diary 🔴
- Availability 🔴

### Priority 4: Allocation Planner ✅
- Allocation Run Management ✅
- Job Lines & Staffing ✅
- Matching & Preferencing ✅

### Priority 5: Operations & Listing 🔴
- Operations Dashboard 🔴
- Listings 🔴

---

## Original Folder Structure

The original proposal for Next.js structure:

```
/app
  /(auth)               # Auth Routes group
    /login/page.tsx
    /signup/page.tsx
    /reset-password/page.tsx
    /callback/route.ts  # OAuth callback handler
  /(dashboard)          # Protected Routes group with App Shell Layout
    /layout.tsx         # Sidebar, Header, AuthCheck
    /page.tsx           # Home Dashboard
    /org/
      /select/page.tsx
    /workers/
      /page.tsx         # Worker List (Data Table)
      /[id]/page.tsx    # Worker Details
      /diary/page.tsx   # Worker Diary
    /allocation/
      /page.tsx         # List Allocation Plans/Runs
      /[runId]/
        /job-lines/page.tsx
        /staffing/page.tsx
        /preferences/page.tsx
  /api/                 # Route Handlers
/components
  /ui/                  # shadcn/ui primitives
  /auth/                # Auth forms
  /workers/             # Worker specific components
  /allocation/          # Allocation specific components
  /layout/              # Shell, Sidebar, Nav components
/lib
  /supabase/
    /server.ts          # Server-side client
    /client.ts          # Client-side client
  /utils.ts             # cn() helper
  /types.ts             # Global types
```

**Actual Structure**: Each of the core components follows a similar pattern but is independently deployable.

---

## Caveats Identified (Still Relevant)

### 1. State Management
- ✅ **Original advice**: Avoid porting `AllocationDatabase` 1:1
- ✅ **What we did**: Used React hooks + services pattern

### 2. Navigation
- ✅ **Original advice**: Use Next.js middleware for auth guards
- ✅ **What we did**: Implemented in all suite applications

### 3. Complex Grids
- ⚠️ **Original advice**: Use TanStack Table for roster grids
- 📝 **What we did**: Custom components (no TanStack dependency)

### 4. Supabase Auth (Cookies vs Tokens)
- ✅ **Original advice**: Use cookie-based auth for SSR
- ✅ **What we did**: SSR-compatible Supabase client in all apps

---

## Lessons Learned

1. **Specialization wins**: Focused components are easier to maintain than one monolith
2. **Vanilla CSS scales**: We avoided Tailwind bloat in management apps
3. **TDD from day one**: Test-driven development caught issues early
4. **Session handoff works**: Edge Function auth handoff enables seamless cross-app navigation

---

## Related Documentation

- [Core Suite Architecture](https://docs.commonbond.au/receptor/docs/app-documentation/architecture) — Current system design
- [Frontend Redevelopment Project](https://docs.commonbond.au/receptor/docs/projects/frontend-redevelopment) — Overall migration tracking
- [Screens Inventory](./screens-inventory) — Detailed screen migration status
