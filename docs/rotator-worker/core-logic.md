---
sidebar_position: 4
---

# Core Logic & Algorithms

This section details the critical business logic handled by the Flutter application.

## 🧮 Allocation Management (`AllocationDatabase`)

The `AllocationDatabase` service is the brain of the matching process. It orchestrates the lifecycle of an allocation run.

### Key Workflows

#### 1. Initialization
- **Action**: Administrator creates a new run.
- **Backend**: Inserts row into `allocation_runs`.
- **Logic**: Sets `stage` to `draft`.

#### 2. Triggering the Match
- **Action**: Administrator clicks "Run Match".
- **Backend**: Invokes a Supabase Edge Function (often via RPC `trigger_match_run`).
- **Frontend**: Polls or subscribes to `allocation_runs` changes to update the stage (e.g., `processing` -> `complete`).

#### 3. Member Management
- Workers are added to a run via the `allocation_run_members` junction table.
- The app allows bulk-add via CSV import or filtering existing workers.

## 📥 Import Logic (`ImportDatabase`)

The application features a robust Excel/CSV import system in `lib/import/`.

### The "Upsert" Strategy
When importing workers or job lines:
1. **Parse**: The file is parsed using the `excel` or `csv` package.
2. **Validate**: Headers are checked against expected schema.
3. **Match**: Rows are matched against existing records (usually by Email or Employee ID).
4. **Upsert**:
   - if exists: Update changed fields.
   - if new: Insert new record.

:::warning Performance
Large imports are processed in batches to avoid timeouts and UI jank.
:::

## 📧 Mass Communication

The app can send bulk emails to workers (e.g., "Preferences Open", "Match Released").

- **Trigger**: `AppServices.sendBulkEmail()`.
- **Backend**: Inserts records into a `communications_queue` table (or calls an Edge Function).
- **Delivery**: A background worker (separate from this app) processes the queue and sends via SendGrid/AWS SES.
