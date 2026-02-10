---
sidebar_position: 2
---

# Workers Module (`lib/workers/`)

The Workers module manages the core `Worker` entity, representing individual staff members within an organisation.

## 📂 Structure
```
lib/workers/
├── models/
│   ├── worker.model.dart          # Core entity (233 lines)
│   ├── worker_history.model.dart  # Audit trail
│   ├── worker_qualification_tag_mapping.model.dart
│   └── worker_qualifications.model.dart
├── pages/                         # Worker profile screens
├── services/                      # Worker-specific services (minimal)
└── widgets/                       # Worker UI components
```

## 🧬 Core Model: `Worker`

### Key Fields
| Field | Type | DB Column | Description |
|:---|:---|:---|:---|
| `id` | `String` | `id` | UUID primary key |
| `firstName` / `lastName` | `String` | `firstname`/`lastname` | Name fields |
| `preferredName` | `String?` | `preferred_name` | Optional display name |
| `email` | `String` | `email` | Contact email |
| `internalId` | `String?` | `internal_id` | Employee ID from external HR system |
| `linkedToUserId` | `bool` | Derived from `linkeduser` | True if linked to a Supabase Auth user |
| `invitedAt` | `DateTime?` | `invited_at` | When the org invite was sent |

### Session Context ("Browsing" Fields)
These fields persist the user's navigation state across devices:
| Field | DB Column | Description |
|:---|:---|:---|
| `currentLocationId` | `browsing_currentlocation` | Last viewed Location |
| `currentTeamId` | `browsing_currentteam` | Last viewed Team |
| `currentAllocationPlanId` | `browsing_currentallocationplan` | Last viewed Plan |

### Nested Collections
| Field | Type | Description |
|:---|:---|:---|
| `aclGroups` | `Map<String, AclGroup>` | Permission groups the worker belongs to |
| `qualificationTagMappings` | `Map<String, WorkerQualificationTagMapping>` | Skills/certifications |
| `shifts` | `Map<String, Shift>` | Assigned shifts (for rostering) |
| `freeBusyData` | `List<WorkerFreeBusy>` | Availability blocks |

## ⚙️ Static Methods
These bypass the service layer for direct DB access:

### `getCurrentWorkerData({ orgId, timezone })`
Fetches the complete profile for the currently logged-in user. Includes nested ACL groups, qualifications, and invite status.

### `fetchAll({ orgId, timezone })`
Admin method to retrieve all workers in an organisation. Returns a `Map<String, Worker>`.

## 🔍 Reverse Engineering Notes
- **Fat Model Anti-Pattern**: The `Worker` class contains both data and some fetch logic (static methods). In the redesign, consider separating into a `WorkerModel` (value object) and `WorkerRepository` (data access).
- **Browsing State Persistence**: The `browsing_*` columns are a core feature allowing users to resume their exact view across sessions. This should be preserved in any rewrite.
