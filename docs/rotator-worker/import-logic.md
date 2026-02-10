---
sidebar_position: 5
---

# Data Import Logic

The application features a critical "Bulk Import" capability to ingest Workers, Job Lines, and Allocation Plans from Excel/CSV files. This logic is complex and handles parsing, validation, and "upserting" (update or insert) into Supabase.

## 📂 Implementation Location

The core logic resides in `lib/import/services/`.

| Entity | Logic Handler | State Holder |
|:---|:---|:---|
| **Workers** | `handle_worker_xlsx_import.dart` | `WorkerImportDatabase.dart` |
| **Job Lines** | `handle_position_xlsx_import.dart` | `PositionImportDatabase.dart` |
| **Allocation Runs** | `handle_allocation_run_xlsx_import.dart` | `AllocationRunImportDatabase.dart` |

## 🏗️ General Workflow (The "Handle" Pattern)

Each `handle_*_import.dart` file exports a function (e.g., `handleWorkerXlsxImport`) that:

1. **Reads Bytes**: Accepts `Uint8List` from the file picker.
2. **Parses Excel**: Uses the `excel` package to decode the spreadsheet.
3. **Iterates Rows**: Skips the header (row 0) and processes data rows.
4. **Validates Columns**: Checks for mandatory headers (e.g., "Email", "EmployeeID").
5. **Maps Data**: Converts Excel cells to a typed Dart object (e.g., `ImportWorker`).
6. **Batches Updates**: Groups the records and sends them to Supabase (often via `upsert`).

## ⚠️ Critical Business Rules

### Worker Import
- **Unique Identifier**: Workers are matched by **Email** (primary) or **Employee ID**.
- **Profile Data**: Columns not matching a standard field are often dumped into the `profile` JSONB column.
- **Org Linking**: Imported workers are automatically linked to the administrator's current Organization ID.

### Job Line Import
- **Structure**: Can import "nested" data (Rotations within Job Lines) depending on the sheet structure.
- **Mapping**: Requires valid `Location` and `Team` names to link correctly.

## 🔍 Reverse Engineering Notes

If rewriting this logic:
- **Validation**: Replicate the column header checks strictly. The current app fails silently or with generic errors if headers don't match exactly.
- **Performance**: The current implementation processes imports client-side. A server-side approach (Edge Function parsing) might be more robust for large datasets (>1000 rows).
- **JSONB**: Pay attention to how "extra" columns are serialized into the `profile` JSONB field, as downstream logic (Allocator) relies on these keys.
