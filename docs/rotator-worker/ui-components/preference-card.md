---
sidebar_position: 2
---

# Preference Card Widget

The `PreferenceCardWidget` is the primary interactive component for workers to rank job lines during an allocation run.

## 📍 File Location
`lib/preferencing/widgets/preference_card_widget.dart` (530 lines)

## 🎯 Purpose
Displays a single Job Line as an interactive card, allowing the worker to:
- View rotation details (position name, dates, duration)
- See calculated preference order (rank badge)
- Move the card up/down in the ranking
- Set Like/Dislike/Neutral preference

## 📥 Props (Constructor)
| Prop | Type | Description |
|:---|:---|:---|
| `jobLine` | `JobLine` | The job line entity to display |
| `calculatedOrderPreference` | `int` | The computed rank (1, 2, 3... or -1 for Random) |
| `isFirstCardInList` | `bool` | Disables "Move Up" button |
| `isFinalCardInList` | `bool` | Disables "Move Down" button |

## 🔧 State Management
| State Variable | Type | Purpose |
|:---|:---|:---|
| `opacityLevel` | `double` | Animation opacity for transitions |
| `verticalScrollController` | `ScrollController` | For scrollbar in card content |

### Provider Dependency
Consumes `PreferenceDatabase` via `Provider.of<PreferenceDatabase>(context)`.

## 🖼️ UI Structure
```
VsScrollbar
└── SingleChildScrollView
    └── AnimatedOpacity
        └── ConstrainedBox (max 400px width)
            └── Container (bordered, rounded)
                ├── ListTile (Job Line Name + Rank Badge)
                │   ├── CircleAvatar (Rank Number or "R")
                │   └── Row [Move Left/Right Buttons]
                ├── Timeline Bar (dynamic width segments)
                └── Column
                    ├── ListView (Rotation Details)
                    │   └── ListTile per rotation
                    │       ├── Position Name
                    │       ├── Date Range
                    │       └── Duration (weeks)
                    └── Row [Like/Dislike/Neutral Buttons]
```

## ⚙️ Key Logic

### Timeline Generation (`_generateTimelineView`)
Creates a horizontal bar showing rotation segments:
1. Calculates flex factors based on rotation duration
2. Calculates empty space widths for gaps between rotations
3. Generates colored `Container` widgets for each segment

### Preference Actions
- **Move Up/Down**: Calls `jobLinePreference.moveUp()` / `moveDown()` RPC, then refreshes database
- **Set Preference**: Calls `preferenceDatabase.setJobLinePreference()` with optimistic UI feedback

## 🔄 Migration Notes (Next.js)

### React Equivalent
```typescript
interface PreferenceCardProps {
  jobLine: JobLine;
  rank: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => Promise<void>;
  onMoveDown: () => Promise<void>;
  onSetPreference: (pref: LikeDislike) => Promise<void>;
}
```

### Key Considerations
- Replace `Provider.of` with React Context or Zustand store
- Replace `AnimatedOpacity` with Framer Motion or CSS transitions
- Replace `VsScrollbar` with native CSS `overflow-y: auto` + custom scrollbar styling
- The timeline flex calculation can be done with CSS Grid or manual width calculations
