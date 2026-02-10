---
sidebar_position: 3
---

# Preference Database (`PreferenceDatabase`)

`PreferenceDatabase` manages the state for a **single Allocation Run** from the perspective of a **Worker**. It handles the interactive "Preferencing" UI where workers rank jobs.

## 📍 File Location
`lib/preferencing/services/preference_database.dart`

## 🧠 State Management
Extends `ChangeNotifier`.
Instantiated per-run (not a singleton).

### Critical State Variables
| Variable | Type | Description |
|:---|:---|:---|
| `mapping` | `PreferenceWorkerMapping` | The root object linking User ↔️ Allocation Run. Contains the `AllocationPlan` snapshot. |
| `jobLinePreferences` | `Map<String, PreferenceJobLine>` | Local cache of the user's choices (Like/Dislike/Neutral). |
| `_filterByLikeDislikePreferences` | `List<Enum>` | Active UI filters (e.g., "Show only Liked"). |
| `_filterByQualificationTagIds` | `List<String>` | Active UI filters for skills. |

## ⚙️ Key Methods

### `getPreferencesByPreference({ likeDislike, applyFilters })`
**The Core Sorting Algorithm**.
- Returns a list of Job Lines for a specific bucket (e.g., "Must Have").
- **Logic**:
  1. Starts with all available Job Lines in the run.
  2. Applies text/tag filters if `applyFilters` is true.
  3. Filters by the requested `LikeDislikePreference` (e.g., `Like`).
  4. returns the Map.

### `getPreferenceNumber({ jobLineId })`
Calculates the dynamic "Rank" (1, 2, 3...) of a specific job line.
- **Complexity**: It essentially reconstructs the *entire* sorted list of preferences (Need -> Like -> Neutral -> Random -> Dislike -> Never) and finds the index of the target job line.
- **Performance**: High cost; runs on every render of the ranking badge.

### `submitPreferences()`
Locks the preferences.
- Calls `SupabaseUpdate.allocationRunSubmitPreferences`.
- Sets `_mapping.submitted = true`.

## 🔍 Reverse Engineering Notes
- **Implicit Ranking**: The app doesn't store an integer "Rank" in the database for every single line. It stores "Like/Dislike" and a "Sort Order" for the categories. The integer rank is calculated on the fly.
- **Filtering Logic**: The filtering code (`lines 198-283`) is extensive and handles nested object graphs (JobLine -> Rotation -> Position -> Team). This logic must be replicated in the new implementation if client-side filtering is required.
