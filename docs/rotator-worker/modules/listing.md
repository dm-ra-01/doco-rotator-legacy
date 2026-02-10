---
sidebar_position: 5
---

# Listing Module (`lib/listing/`)

The Listing module implements a **Shift Marketplace** feature, allowing organisations to post open shifts and workers to apply.

## 📂 Structure
```
lib/listing/
├── models/
│   ├── listing.model.dart            # Core marketplace entity (404 lines)
│   ├── listing_applicant.model.dart  # Worker applications
│   └── category_stat.model.dart      # Aggregation stats
├── pages/                            # Listing browse/create screens
└── widgets/                          # Listing UI components
```

## 📋 Core Model: `Listing`

A `Listing` represents an open shift that needs to be filled.

### Key Fields
| Field | Type | Description |
|:---|:---|:---|
| `id` | `String` | UUID primary key |
| `listingDate` | `DateTime` | When the listing was posted |
| `subject` | `String` | Title/description |
| `shiftId` | `String` | FK to the `Shift` being listed |
| `workforceStaffId` | `String` | The staff member whose shift needs cover |
| `assignedToId` | `String` | Worker who accepted the listing |
| `rate` | `double` | Pay rate |
| `rateUnit` | `RateUnit` | `hour`, `day`, or `total` |
| `listingStatus` | `ListingStatus` | Current workflow state |
| `listingReason` | `ListingReason` | Why the shift is available |

### Enums

#### `ListingStatus`
| Value | Description | Color |
|:---|:---|:---|
| `draft` | Not yet posted | Green |
| `pendingApproval` | Awaiting manager approval | Orange |
| `open` | Available for applications | Blue |
| `assigned` | Worker assigned | Purple |
| `cancelled` | Withdrawn | Red |
| `error` | System error | Red |

#### `ListingReason`
Captures **why** the shift is available:
- `annualLeave`
- `personalSickCarerLeave`
- `compassionateLeave`
- `parentalLeave`
- `confStudyExamLeave`
- `unpaidLeave`
- `additionalCover`
- `other`

#### `RateUnit`
- `hour`, `day`, `total`, `unknown`

### Methods
- `create({ publish })`: Upserts the listing. Sets status based on `publish` flag and `assignedToId`.
- `listingApply(applicant)`: **Unimplemented** - placeholder for worker application logic.
- `getOrgListings({ orgId })`: Fetches all listings for an org via `view_org_listings` view.

## 🔍 Reverse Engineering Notes
- **Shift Swap/Cover Feature**: This module implements a "shift marketplace" where workers can pick up extra shifts. This is distinct from the primary Allocation workflow.
- **Unimplemented Areas**: The `listingApply` method throws `UnimplementedError`, indicating this feature was partially built.
- **Database View Dependency**: `getOrgListings` queries a `view_org_listings` view, which must exist in the database schema.
