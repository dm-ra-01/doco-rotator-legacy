---
sidebar_position: 4
---

# Architecture Analysis

This document analyzes the architectural patterns used in the legacy Flutter `rotator_worker` application. Understanding these patterns helps when porting functionality to the new Next.js applications.

:::info Historical Context
This document was created during the initial codebase audit. The patterns described here informed the design of the new Next.js service layer architecture.
:::

---

## Separation Strategy

The Flutter codebase follows a **MVVM (Model-View-ViewModel)** style architecture, though the "ViewModel" layer is named "Database".

| Layer | Flutter Name | Responsibility | Path |
|:------|:-------------|:---------------|:-----|
| **View (UI)** | Widgets, Pages | Rendering & User Interaction | `lib/*/pages/`, `lib/*/widgets/` |
| **ViewModel (Logic)** | "Database" classes | State Management & Orchestration | `lib/*/services/*_database.dart` |
| **Model (Data)** | Model classes | Data Structure & Business Rules | `lib/*/models/` |
| **Service (API)** | Mixins | Backend Communication | `lib/core/services/` |

---

## Reusable Domain Logic

The primary reusable logic resides in the **Services** and **Database (ViewModel)** classes.

### 1. "Database" Classes (State & Logic)

These classes manage application state, coordinate data fetching, and handle business rules. They extend `ChangeNotifier` and are consumed via `Provider`.

**Flutter Examples:**
- `AllocationDatabase`: Manages the entire allocation planning session
- `AllocationRunMembersDatabase`: Filters and sorts worker lists
- `OrgDatabase`: Manages organisation-level state
- `AppServices`: Global user session and connectivity state

**Next.js Equivalent:**
- React hooks (e.g., `useAllocationPlans`, `useRotations`)
- React Context for global state (e.g., `AuthContext`)

### 2. Service Mixins (Data Access)

| Flutter Mixin | Purpose | Next.js Equivalent |
|:--------------|:--------|:-------------------|
| `SupabaseFetch` | Centralized read operations | Service classes (`*.ts`) |
| `SupabaseUpdate` | Centralized write operations | Service classes (`*.ts`) |
| `AuthServices` | Authentication logic | Supabase client + middleware |

### 3. Models (Rich Domain Objects)

Flutter models include business logic methods directly on the class (Rich Domain Model pattern):

```dart
// Flutter example
class Rotation {
  void assign(Worker worker) { /* logic */ }
}
```

In Next.js, we keep models as pure TypeScript interfaces and put logic in services:

```typescript
// Next.js approach
interface Rotation { /* pure data */ }

// Logic in service
class RotationService {
  static assign(rotation: Rotation, worker: Worker) { /* logic */ }
}
```

---

## UI Components (View)

Flutter UI components are strictly presentation-focused:

| Directory | Responsibility |
|:----------|:---------------|
| `pages/` | Full-screen views with navigation |
| `widgets/` | Reusable UI components |

**Key Pattern**: UI listens to "Database" providers and rebuilds when state changes.

---

## Utils Analysis

`lib/core/utils/utils.dart` contains mixed logic:

| Function | Type | Ported? |
|:---------|:-----|:--------|
| `getInitials(String text)` | Pure domain logic | ✅ Yes |
| `showErrorSnackBar` | UI-dependent helper | ✅ toast notifications |
| `isFullScreen` | UI utility | N/A (different paradigm) |

---

## Lessons Applied to Next.js

The Flutter architecture analysis informed these decisions for Next.js:

| Flutter Pattern | Next.js Implementation |
|:----------------|:-----------------------|
| "Database" ChangeNotifiers | React hooks with `useState`/`useEffect` |
| Provider dependency injection | React Context |
| `SupabaseFetch`/`SupabaseUpdate` | Service classes per domain |
| `go_router` redirects | Next.js middleware |
| Real-time subscriptions | Supabase channels in useEffect |

---

## Leaky Abstractions (Avoided in Next.js)

The Flutter codebase had some patterns we explicitly avoided:

1. **"Database" classes importing `material.dart`**: In Next.js, services are pure TypeScript with no React dependencies
2. **Mixed Utils**: In Next.js, UI utilities are separate from domain utilities
3. **Implicit Provider dependency**: In Next.js, hooks explicitly declare their dependencies

---

## Related Documentation

- [Layered Architecture](https://docs.commonbond.au/receptor/docs/app-documentation/architecture) — Current Next.js architecture
- [Technical Inventory](./technical-inventory) — API and data model reference
- [Screens Inventory](./screens-inventory) — Complete screen mapping
