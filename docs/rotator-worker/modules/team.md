---
sidebar_position: 3
---

# Team Module (`lib/team/`)

The Team module manages organisational hierarchy elements like Teams and Team Tags.

## 📂 Structure
```
lib/team/
├── models/
│   ├── team_tag.model.dart          # Tag definition
│   └── team_tag_mapping.model.dart  # Tag-to-Team assignments
├── pages/                           # Team management screens
└── widgets/                         # Team UI components
```

## 🏷️ Core Model: `TeamTag`

Team Tags are labels applied to Teams for filtering and categorisation (e.g., "Pediatrics", "Weekend Only").

### Key Fields
| Field | Type | DB Column | Description |
|:---|:---|:---|:---|
| `id` | `String` | `id` | UUID primary key |
| `name` | `String` | `name` | Display label |
| `orgId` | `String` | `org` | FK to `orgs` table |
| `createdAt` | `DateTime` | `created_at` | Timestamp |

### DB Schema (Embedded Comment)
The model file helpfully includes the source DDL:
```sql
create table public.team_tags (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  org uuid not null,
  constraint team_tags_pkey primary key (id),
  constraint team_tags_org_fkey foreign key (org) references orgs (id) on update cascade on delete cascade
);
```

## 🔗 `TeamTagMapping`

Links a `TeamTag` to a specific `Team`.

## 🔍 Reverse Engineering Notes
- **Org-Scoped Only**: Unlike Qualification Tags (which can be worker-level), Team Tags are org-scoped and applied to teams, not individuals.
- **Used for Filtering**: In the Allocation UI, Team Tags filter which Job Lines are visible.
