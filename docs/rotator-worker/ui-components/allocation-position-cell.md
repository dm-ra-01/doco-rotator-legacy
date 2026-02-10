---
sidebar_position: 3
---

# Allocation Position Cell Widget

The `AllocationPositionCellWidget` renders a single row in the Gantt-style allocation grid, displaying rotations for a specific position.

## 📍 File Location
`lib/allocation_plan/widgets/allocation_position_cell_widget.dart` (620 lines)

## 🎯 Purpose
Displays a horizontal timeline for a single Position, showing:
- Existing rotations as colored blocks
- Empty/available weeks where rotations can be created
- Locked weeks (no position mapping for that period)
- Conflicting/overlapping rotations (red highlight)
- Rotations from other allocation runs (gradient highlight)

## 📥 Props (Constructor)
| Prop | Type | Description |
|:---|:---|:---|
| `position` | `Position` | The position entity |
| `allocationRunId` | `String` | The current allocation run context |

## 🔧 State Management
Stateful widget with no local state variables. Relies entirely on `AllocationDatabase` via Provider.

## 🖼️ UI Structure
```
Container (bordered, rounded)
└── Stack
    ├── generateExistingRotationItems() → List<Positioned>
    │   ├── Conflicting rotations (red box + error icon)
    │   ├── Normal rotations (colored box + edit button)
    │   ├── Empty slots (InkWell for creation)
    │   ├── Locked slots (red background)
    │   ├── Erroneous rotations (red + warning)
    │   └── Other-run rotations (gradient)
    └── generateSeparatorItems() → List<Positioned>
        └── Vertical grey lines every 4 weeks
```

## ⚙️ Key Logic

### Week/Position Calculation
Uses constants from `core/constants.dart`:
- `kAllocationGridWeekWidth`: Width of a single week column
- `kAllocationGridPadding`: Padding between items
- `kAllocationContentRowHeight`: Height of a content row

### Rotation Positioning
```dart
left = (weekWidth + padding * 2) * (rotation.startDate.difference(runStart).inDays / 7)
width = (weekWidth + padding * 2) * (rotation.duration.inDays / 7)
```

### Conflict Detection
```dart
final conflicts = rotations.where(
  (element) =>
    element.startDate.isBefore(rotation.endDate) &&
    element.endDate.isAfter(rotation.startDate) &&
    element.id != rotation.id,
);
```

### Timezone Compensation (Lines 295-312)
Handles DST offsets by comparing timezone offsets and adjusting calculated dates.

## 🔄 Migration Notes (Next.js)

### React Equivalent
```typescript
interface AllocationPositionCellProps {
  position: Position;
  allocationRunId: string;
  runStartDate: Date;
  totalWeeks: number;
  rotations: Rotation[];
  positionMappings: PositionAllocationPlanMapping[];
  onCreateRotation: (startDate: Date) => void;
  onEditRotation: (rotation: Rotation) => void;
}
```

### Key Considerations
- This is effectively a **custom Gantt chart row**
- Consider using a dedicated Gantt library (e.g., `react-gantt-timeline`)
- The DST/timezone compensation logic is critical and must be ported
- The stacked `Positioned` components in Flutter map to `position: absolute` divs in CSS
- Color logic should be extracted into a utility function
