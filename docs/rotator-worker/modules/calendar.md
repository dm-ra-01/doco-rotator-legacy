---
sidebar_position: 4
---

# Calendar Module (`lib/calendar/`)

The Calendar module handles personal scheduling (appointments, availability) outside the core Allocation workflow.

## 📂 Structure
```
lib/calendar/
├── models/
│   ├── personal_appointment.model.dart  # User-created events
│   ├── calendar_item.dart               # Generic calendar event
│   ├── calendar_item_type.model.dart    # Event type enum
│   ├── recurrence.model.dart            # Recurring event rules
│   ├── color_option.model.dart          # UI color choices
│   └── picker.model.dart                # Date/time picker state
├── pages/                               # Calendar views
├── services/                            # Calendar data services
└── widgets/                             # Calendar UI components
```

## 📅 Core Model: `PersonalAppointment`

Represents a user-created personal event (e.g., "Dentist Appointment", "Family Leave").

### Key Fields
| Field | Type | DB Column | DB Table |
|:---|:---|:---|:---|
| `id` | `String` | `id` | `events_personal` |
| `subject` | `String` | `subject` | Event title |
| `startTime` / `endTime` | `TZDateTime` | `starttime`/`endtime` | Timezone-aware timestamps |
| `startTimeZone` / `endTimeZone` | `String` | `starttimezone`/`endtimezone` | IANA timezone strings |
| `location` | `String` | `location` | Free-text location |
| `googlePlaceId` | `String` | `googleplaceid` | Optional Google Maps reference |
| `color` | `Color` | `color` | Stored as integer value |

### Methods
- `publish()`: Upserts the appointment to Supabase (`events_personal` table).
- `delete()`: Removes the appointment.

### Enums
- **`PersonalApptStatus`**: `draft`, `published`, `unknown`, `error`.

## 🔍 Reverse Engineering Notes
- **Self-Contained CRUD**: Unlike Allocation entities (which use `OrgDatabase`), `PersonalAppointment` has inline CRUD logic using `GetIt<SupabaseClient>`.
- **Timezone Support**: The model explicitly tracks start/end timezones, using the `timezone` package (`TZDateTime`). This is critical for multi-region deployments.
- **Low Usage Indicator**: The `calendar/` module has 26 files but limited integration with the main Allocation flow. It may be deprecated or secondary functionality.
