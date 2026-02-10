---
sidebar_position: 2
---

# Architecture & Code Structure

The **Rotator Worker** application follows a modular, feature-based architecture pattern typical of large Flutter applications. Dependencies are managed via `GetIt` (Service Locator) and `Provider` (State Management).

## 📂 Directory Structure

The `lib/` directory is organized by business domain rather than technical layer.

```bash
lib/
├── main.dart           # Application entry point & AppState
├── core/               # Shared utilities, services, and UI components
│   ├── services/       # Global services (AppServices, etc.)
│   ├── pages/          # auth & splash screens
│   └── utils/          # Helpers
├── allocation_plan/    # Allocation run management
├── workers/            # Worker profile & administration
├── listing/            # Job definition & management
├── preferencing/       # Worker preference viewing
└── ... (other modules)
```

## 🧩 State Management

The application uses **Provider** for state management, often lifting state up to specific "Database" services that act as view models or controllers.

### Key Providers

| Provider / Database | Scope | Purpose |
|:---|:---|:---|
| `AppServices` | Global | Manages authentication state, connectivity, and current user context. |
| `OrgDatabase` | Organization | Manage organization-level data and context. |
| `AllocationDatabase` | Feature | Handles logic for a specific allocation run or worker context. |
| `OperationsDatabase` | Feature | Banner/Operations management. |

### Service Locator (`GetIt`)

Crucial services are registered as singletons in `GetIt` for easy access throughout the widget tree, although the app heavily relies on `Provider` for reactive UI updates.

## 🔌 Supabase Integration

The application uses the `supabase_flutter` package.

### Client Initialization
The Supabase client is initialized in `main.dart` and accessed via `Supabase.instance.client` or through the `AppServices` abstraction.

### Repository Pattern
While not strictly enforced, most data access logic resides in `*Database.dart` files within `services/` folders of each module.

**Example `WorkersDatabase.dart`:**
```dart
Future<void> updateWorker(String workerId, Map<String, dynamic> data) async {
  await Supabase.instance.client
      .from('workers')
      .update(data)
      .eq('id', workerId);
}
```

## 🛠️ Core Modules Deep Dive

### 1. Allocation Plan (`lib/allocation_plan/`)
Handles the lifecycle of an "Allocation Run" (e.g., "2024 Intern Match").
- **Services**: `AllocationDatabase.dart`, `AllocationRunMembersDatabase.dart`
- **Key Logic**: triggering the matching algorithm via RPC, managing members, locking/unlocking runs.

### 2. Workers (`lib/workers/`)
Management of the `public.workers` table.
- **Features**: Invite system (generating invite codes), profile key-value updates, bulk actions.

### 3. Import (`lib/import/`)
Complex logic for parsing Excel files and batch-inserting data.
- **Services**: `WorkerImportDatabase.dart`, `PositionImportDatabase.dart`
- **Logic**: Validates headers, maps columns to DB fields, and handles "upsert" logic.

## 🔄 Navigation

Navigation is handled by **GoRouter** (defined in `main.dart`).
- Routes are guarded based on `AppAuthState` (e.g., redirecting to `/login` if signed out).
- Deep linking is supported for invites (e.g., `/workerInvite?code=...`).
