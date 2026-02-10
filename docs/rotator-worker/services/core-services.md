---
sidebar_position: 1
---

# Core Services

The application relies on a set of core mixins and static service classes to handle low-level Supabase interactions. These services abstract the raw Supabase client and perform standard error handling and type mapping.

## 📂 `lib/core/services/`

### 1. `SupabaseFetch` (`supabase_fetch.dart`)
**Role**: Global Read-Only API
A massive static class containing all `SELECT` queries used by the application.

**Key Methods**:
- `positionsInTeam(teamId)`: Fetches positions with nested rotations using joined query syntax.
- `preferenceWorkerMapping(mappingId)`: Deep-fetches the worker's allocation context (Run, Plan, Job Lines).
- `workerPreferences(mappingId)`: Returns a Map of `PreferenceJobLine` objects.

**Reverse Engineering Notes**:
- Queries often use deep nesting (e.g., `select('*, rotations(*, job_lines(*))')`).
- If porting to Next.js, these should be broken down into specific Service classes (e.g., `PositionService`, `PreferenceService`) using the Supabase JS client.

### 2. `SupabaseUpdate` (`supabase_update.dart`)
**Role**: Global Write API (Updates)
Handles `UPDATE` operations and RPC calls that modify state.

**Key Methods**:
- `worker(worker)`: Updates generic worker profile fields.
- `teamTag(teamTag)`: Updates team tag properties (color, name).
- `allocationRunSubmitPreferences(...)`: Calls the critical RPC `allocation_run_submit_preferences` to lock in user choices.

### 3. `SupabaseCreate` (`supabase_create/*.dart`)
**Role**: Global Write API (Inserts)
Handles creation of new entities.

**Key Methods**:
- `position(...)`: Creates a new Position entity.
- `workerQualificationTagMapping(...)`: Links a qualification to a worker.

### 4. `SupabaseDelete` (`supabase_delete.dart`)
**Role**: Global Delete API
Handles soft or hard deletes depending on the entity type.

### 5. `SupabaseFunction` (`supabase_function.dart`)
**Role**: RPC & Edge Function Gateway
Explicitly calls Postgres Functions (RPC) or Supabase Edge Functions.

**Key Methods**:
- `sendWorkerInvite(workerId)`: Triggers the email invitation logic (Edge Function).
- `finaliseOwnAllocationJobLineMatch(...)`: RPC call to confirm a self-match.
