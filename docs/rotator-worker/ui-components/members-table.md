---
sidebar_position: 4
---

# Members Table Widget

The `AllocationRunCurrentMembersWidget` is the largest and most complex widget in the codebase (1073 lines, 57KB). It renders the "Members" tab in the Allocation Planner.

## 📍 File Location
`lib/allocation_plan/widgets/allocation_run_current_members_widget.dart`

## 🎯 Purpose
Displays a comprehensive table of all workers enrolled in an allocation run, with:
- Filtering (by submission status, signup status, qualification tags)
- Bulk selection (checkboxes for batch operations)
- Individual row actions (view, invite, lock, withdraw)
- Aggregated statistics (counts by status)

## 📥 Props
Minimal props - most data is consumed from `AllocationRunMembersDatabase` via Provider.

## 🔧 State Management
Consumes multiple providers:
- `AllocationDatabase`
- `AllocationRunMembersDatabase`

### Key State from `AllocationRunMembersDatabase`
| Getter | Type | Description |
|:---|:---|:---|
| `filteredMappings` | `List<AllocationRunWorkerMapping>` | Filtered list based on active filters |
| `numWorkersAwaitingSignUp` | `int` | Workers invited but not signed up |
| `numWorkersSignedUp` | `int` | Workers with linked auth accounts |
| `numWorkersWithdrawn` | `int` | Withdrawn workers |
| `numWorkersUnassigned` | `int` | Workers without any match |
| `numWorkersLocked` | `int` | Locked workers |
| `numSubmittedMappings` | `int` | Workers who submitted preferences |

## 🖼️ UI Structure (Simplified)
```
Column
├── FilterBar
│   ├── TextSearch
│   ├── DropdownFilters (Status, Qualification)
│   └── ToggleButtons (Submitted, Signed Up, etc.)
├── StatsRow
│   └── CounterChips [Submitted, Signed Up, Unassigned, etc.]
├── SelectAllCheckbox
└── ListView.builder
    └── WorkerRowWidget (per mapping)
        ├── Checkbox
        ├── WorkerName
        ├── StatusBadges
        └── ActionButtons [View, Invite, Lock, Withdraw]
```

## ⚙️ Key Logic

### Filter Application
Filters are applied cumulatively in `AllocationRunMembersDatabase.filteredMappings`:
1. Text search (name, email, internal ID)
2. Submission status (`filterBySubmitted`, `filterByUnsubmitted`)
3. Signup status (`filterBySignedUp`, `filterByNotSignedUp`)
4. Visibility (`filterByVisible`, `filterByInvisible`)
5. Lock status (`filterByLocked`, `filterByUnlocked`)
6. Qualification tags

### Bulk Operations
- Select All: Adds all visible mapping IDs to `selectedWorkers`
- Batch Invite: Loops through selected and calls invite RPC
- Batch Lock/Unlock: Loops through selected and updates `locked` field

## 🔄 Migration Notes (Next.js)

### React Equivalent
```typescript
interface MembersTableProps {
  allocationRunId: string;
}

// Use React Query or SWR for data fetching
// Use @tanstack/react-table for table rendering
// Use Zustand or Context for filter state
```

### Key Considerations
- **Break into subcomponents**: This 1073-line widget should become 5-10 smaller React components
- **Use a table library**: `@tanstack/react-table` or `ag-grid` for virtual scrolling and performance
- **Server-side filtering**: Consider moving filter logic to Supabase queries for large datasets
- **Separate concerns**: Filter state, selection state, and data fetching should be distinct hooks
