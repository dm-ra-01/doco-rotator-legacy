---
sidebar_position: 4
---

# Allocation Domain Services

The Allocation domain is complex and split across multiple "Database" classes, each handling a specific slice of the "Admin Planner" view.

## 📂 `lib/allocation_plan/services/`

### 1. `AllocationDatabase` (`allocation_database.dart`)
**Role**: The Parent Container for an Admin viewing an Allocation Plan.

**Key Responsibilities**:
- **Run Selection**: Tracks `_currentAllocationRunId`.
- **Data Loading**: Fetches the massive `AllocationPlan` object, including nested Runs, Job Lines, and Mappings.
- **Global Settings**: Toggles like `jobLineDisplayAllocatedWorker`.

**Critical State**:
- `_allocationPlans`: Map of all plans the user can see.
- `_privilegesByCurrentAllocationPlan`: Returns the specific permissions the user has for *this* plan (e.g., View vs Edit).

### 2. `AllocationRunMembersDatabase` (`allocation_run_members_database.dart`)
**Role**: Manages the "Members" tab (Recruitment/Staffing view).

**Key Features**:
- **Filtering Powerhouse**: Contains extensive filtering logic for finding workers:
  - `numWorkersAwaitingSignUp`
  - `numWorkersUnassigned`
  - `numWorkersLocked`
- **Selection State**: Tracks `_selectedWorkers` (multi-select checkboxes) for batch operations.

**Reverse Engineering Note**:
The getters (e.g., `numWorkersUnassigned`) contain business logic defining what "Unassigned" means (Lines 346-356). This logic should be ported to a Backend Service or Selector in the new app.

## 📂 `lib/allocation_match/services/`

### 3. `MatchCreateDatabase` (`match_create_database.dart`)
**Role**: Manages the "Match" tab (Algorithm trigger & Review).

**Key Responsibilities**:
- **Algorithm Config**: Holds state for `MatchWeightings`.
- **Result Filtering**: Filters the list of `AllocationRunWorkerMapping` based on match status.
- **Manual Override**: Methods to force-match a worker to a line.

**Logic to Note**:
- `filteredMappings` (Line 101): Sorting logic prioritizes `lastName` but has complex `retainWhere` clauses for filtering by qualification, match status, and text search.
