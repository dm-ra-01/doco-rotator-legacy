---
sidebar_position: 1
title: Services Architecture
---

import DocCardList from '@theme/DocCardList';

# Services & State Architecture 🧠

The legacy Flutter application uses a **Service-Layer Pattern** (implemented as "Databases") to decouple UI from data logic. These classes typically extend `ChangeNotifier` and are injected into the widget tree via `Provider` or `GetIt`.

This section provides forensic documentation of the key services found in `lib/*/services/`, detailing their internal state, API dependencies, and critical business logic.

:::info Terminology
In the legacy codebase, classes named `*Database` (e.g., `OrgDatabase`) are effectively **ViewModels** or **Stores**. They do not represent literal SQL databases but rather client-side state containers.
:::

## Service Registry

<DocCardList />

## Common Patterns

### 1. The "Init" Pattern
Most services have an `initDatabase()` or `refreshDatabase()` method that acts as the constructor logic. It often performs a sequence of `await` calls to hydrate the local state from Supabase.

### 2. Optimistic Updates
Write operations usually follow this pattern:
1. Call Supabase API.
2. `then()`: Update local Map/List state with result.
3. `notifyListeners()`: Trigger UI rebuild.

### 3. Centralized Fetching
Raw Supabase queries are rarely found inside the Database classes. Instead, they call static methods in `lib/core/services/supabase_fetch.dart` or `supabase_update.dart`.
