---
sidebar_position: 2
---

# Screens & Routes Inventory

This document provides a comprehensive inventory of all screens and routes within the legacy Flutter `rotator_worker` application, along with their migration status to the new Next.js applications.

:::info Migration Reference
Use this inventory to track which screens have been ported and which remain in the legacy application.
:::

---

## Top-Level Routes (GoRouter)

Defined in `lib/main.dart`.

| Route Path | Widget / Screen | Migration Status | Target App |
|:-----------|:----------------|:-----------------|:-----------|
| `/` | `OrgHomePage` | ✅ Migrated | Planner + Workforce |
| `/userOnboarding` | `UserOnboarding` | ✅ Migrated | Preferencer |
| `/passwordReset` | `PasswordResetForm` | ✅ Migrated | All Apps |
| `/orgSelect` | `OrgSelect` | 🟡 Partial | Planner (implicit) |
| `/splashScreen` | `SplashScreen` | ✅ Migrated | All Apps |
| `/workerInvite` | `WorkerInviteClaim` | ✅ Migrated | Preferencer |
| `/login` | `LoginChooseProvider` | ✅ Migrated | All Apps |

---

## Dashboard Sub-Navigation

These screens are rendered within the `OrgHomePage` based on the `OrgHomeTabSelection` state.

### Organisation Management (→ Workforce Frontend)

| Tab Selection | Widget / Screen | Migration Status | Notes |
|:--------------|:----------------|:-----------------|:------|
| `workersGlobal` | `WorkerList` | 🔴 Not Started | Staff directory |
| `workerList` | `WorkerList` | 🔴 Not Started | Team-specific workers |
| `workerGroups` | `PositionListDisplay` | ✅ Migrated | Position list page |
| `teams` | `TeamPositionView` | ✅ Migrated | Team management |
| `teamPositions` | `TeamPositionView` | ✅ Migrated | Position management |

### Worker Operations (→ TBD)

| Tab Selection | Widget / Screen | Migration Status | Notes |
|:--------------|:----------------|:-----------------|:------|
| `dashboard` | `OrgDashboard` | 🔴 Not Started | |
| `diary` | `WorkerDiary` | 🔴 Not Started | Calendar view |
| `listings` | `ListingDashboard` | 🔴 Not Started | |
| `operations` | `OperationsDashboard` | 🔴 Not Started | |
| `teamSchedule` | `TeamScheduleView` | 🔴 Not Started | |

### Allocation Planner (→ Planner Frontend)

| Tab Selection | Widget / Screen | Migration Status | Notes |
|:--------------|:----------------|:-----------------|:------|
| `allocationPlanner` | `AllocationRunJobLineTab` | ✅ Migrated | Job line management |
| `allocationJobLines` | `AllocationRunJobLineTab` | ✅ Migrated | |
| `allocationStaffing` | `AllocationRunStaffingTab` | ✅ Migrated | Worker mappings |
| `allocationPositions` | `AllocationRunPositionTab` | ✅ Migrated | Position mappings |
| `allocationMembers` | `AllocationRunWorkers` | ✅ Migrated | Run recruitment |
| `allocationPreferences` | `AllocationRunPreferencesList` | ✅ Migrated (Preferencer) | Worker-side |
| `allocationEligibility` | `AllocationRunEligibilityList` | 🔴 Not Started | |
| `allocationWeightings` | `AllocationRunWeightingsList` | 🔴 Not Started | |
| `allocationMatch` | `AllocationMatchList` | 🔴 Not Started | Algorithm results |
| `allocationReview` | `AllocationRunReview` | 🔴 Not Started | Final review |

---

## Migration Summary

| Category | Total Screens | Migrated | Remaining |
|:---------|:--------------|:---------|:----------|
| **Authentication** | 4 | 4 | 0 |
| **Organisation Management** | 5 | 3 | 2 |
| **Worker Operations** | 5 | 0 | 5 |
| **Allocation Planner** | 10 | 6 | 4 |
| **Total** | 24 | 13 | 11 |

---

## File Path Reference

| Category | Flutter Path |
|:---------|:-------------|
| Auth Screens | `lib/auth/pages/` |
| Org Management | `lib/admin/screens/org_management/` |
| Team Management | `lib/admin/screens/team_management/` |
| Worker Management | `lib/admin/screens/worker_management/` |
| Allocation | `lib/allocation_plan/pages/` |
| Preferencing | `lib/preferencing/pages/` |
