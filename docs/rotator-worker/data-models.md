---
sidebar_position: 3
---

# Data Models

The application's data models closely mirror the Supabase schema, as the Flutter app interacts directly with the database.

## 🗺️ Schema Mapping

| Dart Model | Supabase Table | Directory | Description |
|:---|:---|:---|:---|
| `Worker` | `public.workers` | `lib/workers/models/` | Core user entity for medical staff. |
| `JobLine` | `public.job_lines` | `lib/listing/models/` | Definition of a job role and its rotations. |
| `AllocationRun` | `public.allocation_runs` | `lib/allocation_plan/models/` | A matching cycle (e.g., "2024 Intern Match"). |
| `AllocationAttributes` | `public.allocation_run_members` | `lib/allocation_plan/models/` | A worker's status within a specific run. |

## 🧬 Key Transformations

:::info Direct Mapping
Most models use `fromJson` and `toJson` factories that map 1:1 with the Postgres columns.
:::

### Worker Model (`lib/workers/`)
This is the central entity. It aggregates data from `public.users` (metadata) and `public.workers` (profile).

```dart
class Worker {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final Map<String, dynamic> profile; // JSONB column
  // ...
}
```

### JSONB Handling
The `profile` column in `public.workers` and `data` column in `public.allocation_runs` are heavily used to store flexible data. The Dart models typical expose these as `Map<String, dynamic>`.

## 🔄 State Synchronization

The app uses `Provider` to sync these models with the UI. When a database update occurs:
1. The service calls Supabase `update()`.
2. The service fetches the fresh row.
3. The `Model.fromJson` factory creates a new immutable instance.
4. `notifyListeners()` triggers a UI rebuild.
