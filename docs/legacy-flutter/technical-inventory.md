---
sidebar_position: 3
---

# Technical Inventory

This document provides a technical overview of the legacy Flutter `rotator_worker` application's architecture, API layer, and data models. Use this as a reference when porting functionality to the new Next.js applications.

---

## API & Data Layer

The application interacts with a **Supabase** backend.

### Architecture Pattern

The Flutter codebase follows a **MVVM-like** pattern:

| Layer | Flutter Implementation | Next.js Equivalent |
|:------|:-----------------------|:-------------------|
| **View (UI)** | Widgets and Pages | React Components |
| **ViewModel (Logic)** | "Database" classes (`*_database.dart`) | Hooks + Services |
| **Model (Data)** | Pure Dart classes | TypeScript interfaces |
| **Service (API)** | `SupabaseFetch`, `SupabaseUpdate` mixins | Service classes |

### Centralized Data Access

Direct Supabase interactions are centralized in two mixins:

- **`SupabaseFetch`** (`lib/core/services/supabase_fetch.dart`): Handles all `SELECT` queries
- **`SupabaseUpdate`** (`lib/core/services/supabase_update.dart`): Handles `UPDATE`, `INSERT`, `DELETE`, and RPC calls

:::tip Porting Guide
In Next.js, these are replaced by:
- **Service classes** (e.g., `AllocationPlanService`, `LocationService`)
- **React hooks** (e.g., `useAllocationPlans`, `useLocations`)
:::

---

## Authentication

Authentication is managed by `AuthServices` and monitored by `AppServices`.

### Providers

| Provider | Flutter Package | Next.js Implementation |
|:---------|:----------------|:-----------------------|
| Email/Password | Supabase Auth | ✅ Supabase Auth (SSR) |
| Google | `google_sign_in` | ✅ Supabase OAuth |
| Apple | `sign_in_with_apple` | ✅ Supabase OAuth |
| Azure | Supabase OAuth | ✅ Supabase OAuth |

### Auth Flow (Migrated)

The authentication flow has been fully ported to Next.js:

1. **Login**: Edge Function session handoff from Preferencer
2. **Session Management**: Next.js middleware + Supabase cookies
3. **State Sync**: React Context (`AuthProvider`)
4. **User Data**: Server-side profile fetching

---

## Data Models

Located primarily in `lib/<feature>/models/`.

### Core Models (✅ Ported to TypeScript)

| Flutter Model | TypeScript Location | Status |
|:--------------|:--------------------|:-------|
| `AppUser` | `src/types/auth.ts` | ✅ Ported |
| `Org` | `supabase-receptor` generated types | ✅ Ported |
| `Location` | `src/types/workforce.ts` | ✅ Ported |
| `Worker` | `src/types/workers.ts` | ✅ Ported |

### Allocation & Planning Models (✅ Ported)

| Flutter Model | TypeScript Location | Status |
|:--------------|:--------------------|:-------|
| `AllocationPlan` | `src/types/planning.ts` | ✅ Ported |
| `AllocationRun` | `src/types/planning.ts` | ✅ Ported |
| `JobLine` | `src/types/planning.ts` | ✅ Ported |
| `Rotation` | `src/types/planning.ts` | ✅ Ported |
| `AllocationRunWorkerMapping` | `src/types/planning.ts` | ✅ Ported |

### Matching & Preferences Models

| Flutter Model | TypeScript Location | Status |
|:--------------|:--------------------|:-------|
| `AllocationMatch` | — | 🔴 Not Started |
| `PreferenceJobLine` | `src/types/preferences.ts` | ✅ Ported |
| `PreferenceWorkerMapping` | `src/types/preferences.ts` | ✅ Ported |

### Security Models

| Flutter Model | TypeScript Location | Status |
|:--------------|:--------------------|:-------|
| `AclGroup` | — | 🔴 Not Started |
| `AclRight` | — | 🔴 Not Started |

---

## Key Service Files Reference

| Flutter File | Purpose | Next.js Equivalent |
|:-------------|:--------|:-------------------|
| `app_services.dart` | Global app state | `AuthContext` + hooks |
| `supabase_fetch.dart` | Read operations | `*Service.ts` classes |
| `supabase_update.dart` | Write operations | `*Service.ts` classes |
| `allocation_database.dart` | Allocation state | `useAllocationPlans` hook |
| `org_database.dart` | Organisation state | `useOrganization` hook |

---

## Real-time Subscriptions

The Flutter app uses Supabase real-time in limited scenarios:

| Feature | Flutter Implementation | Next.js Status |
|:--------|:-----------------------|:---------------|
| Auth state changes | `onAuthStateChange` | ✅ Middleware |
| Row locking | Channel subscriptions | 🔴 Not implemented |
| Live updates | — | 🔴 Not implemented |

---

## Related Documentation

- [Architecture Analysis](./architecture-analysis) — Domain logic separation patterns
- [Screens Inventory](./screens-inventory) — Complete screen mapping
- [Generated Supabase Types](https://receptor.commonbond.au/docs/infrastructure/database-schema) — Current TypeScript types
