---
sidebar_position: 2
---

# Org Database (`OrgDatabase`)

`OrgDatabase` is the primary "Global State" container for the application. It manages the current user's session context (Team, Location), global permissions, and organisation-wide data.

## 📍 File Location
`lib/organisation/services/org_database.dart`

## 🧠 State Management
Extends `ChangeNotifier`.
Registered as a Singleton via `Provider` or `GetIt`.

### Critical State Variables
| Variable | Type | Description |
|:---|:---|:---|
| `_currentWorker` | `Worker` | The currently logged-in user's profile. |
| `_currentOrg` | `Org` | The active organisation context. |
| `orgId` | `String` | ID of the active organisation. |
| `_privilegesGlobal` | `List<AclRight>` | Flattened list of all rights the user possesses via their Group memberships. |
| `_workers` | `Map<String, Worker>` | Cache of *all* workers in the org (Admin only). |

## ⚙️ Key Methods

### `initDatabase()`
The boot sequence for the application.
1. **Fetch User**: Calls `refreshMyWorker` to get the profile.
2. **Flatten Rights**: Iterates `currentWorker.aclGroups` to build `_privilegesGlobal`.
3. **Fetch Org**: Loads timezone and settings.
4. **Fetch Mappings**: Loads `_workerAllocationRunMappings` (for the allocation dashboard).
5. **Admin Data**: If user has `orgWorkerView`, fetches `refreshOrgWorkers`.

### Context Switchers
- **`setTeamId(String teamId)`**: 
  - Updates the `browsing_currentteam` column on the `workers` table.
  - Triggers `refreshTeam()` to load positions/schedule for that team.
  - Used when navigating the "Org Home" dashboard.

- **`setLocationId(String locationId)`**:
  - Updates `browsing_currentlocation`.
  - Clears current Team selection.

### CRUD Wrappers
The class exposes wrappers around `SupabaseCreate`/`Update`/`Delete` that automatically update local state (`notifyListeners`) upon success, providing Optimistic UI behavior.
- `createPosition(position)`
- `updateWorker(worker)`
- `createTeamTag(teamTag)`

## 🔍 Reverse Engineering Notes
- **Permission Flattening**: The logic to flatten ACL rights (`lines 324-330`) is critical. In the new system, this might be handled by RLS or a dedicated Auth Context.
- **Session Persistence**: The app persists navigation state (Current Team) to the database (`workers` table). This allows users to resume specific views across devices, a feature that should likely be preserved.
