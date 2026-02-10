---
sidebar_position: 1
---

# UI Component Catalog

This section catalogs the key Flutter widgets used in `rotator_worker` to enable accurate migration to Next.js/React. Each widget is documented with its purpose, props, state logic, and migration recommendations.

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Component Distribution

| Module | Widgets | Largest Component |
|:---|:---:|:---|
| `allocation_plan/widgets/` | 23 | `allocation_run_current_members_widget.dart` (57KB) |
| `preferencing/widgets/` | 8 | `preference_card_widget.dart` (25KB) |
| `workers/widgets/` | 6 | Various profile components |
| `calendar/widgets/` | 12 | Calendar grid views |
| `listing/widgets/` | 11 | Marketplace cards |

## Migration Priority

:::tip Migration Strategy
Start with **independent, reusable components** before tackling complex stateful widgets. The preferencing and listing components are good candidates for early migration as they have clear interfaces.
:::

| Priority | Component | Reason |
|:---:|:---|:---|
| 1️⃣ | `PreferenceCardWidget` | Core user interaction for allocation |
| 2️⃣ | `RotationLineItemWidget` | Reusable across multiple views |
| 3️⃣ | `AllocationPositionCellWidget` | Complex Gantt-style grid |
| 4️⃣ | `AllocationRunCurrentMembersWidget` | Most complex, defer to last |
