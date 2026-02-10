---
sidebar_position: 1
---

# Legacy Flutter Reference

This section contains reference documentation for the **legacy Flutter `rotator_worker` application**. These documents were created during the initial audit phase and serve as guides for the ongoing migration to Next.js.

:::warning Deprecation Notice
The Flutter `rotator_worker` application is **deprecated** and being replaced by the [Core Suite Strategy](https://docs.commonbond.au/receptor/docs/app-documentation/architecture). This documentation is preserved for reference during the migration process.
:::

---

## Migration Status Overview

The Flutter application's functionality is being distributed across the core suite of specialized services:

| Flutter Module | Target Next.js App / Service | Migration Status |
|:---------------|:-------------------|:-----------------|
| **Organisation Management** (Teams, Locations, Positions) | [Workforce Frontend](https://docs.commonbond.au/receptor/docs/projects/workforce-frontend) | 🟡 In Progress |
| **Allocation Planner** (Plans, Runs, Job Lines, Rotations) | [Planner Frontend](https://docs.commonbond.au/receptor/docs/projects/planner-frontend) | ✅ Complete |
| **Worker Preferencing** (Preferences, Rankings) | [Preferencer Frontend](https://docs.commonbond.au/receptor/docs/projects/my-preferences-microservice) | ✅ Complete |
| **Matching Algorithm** | [Allocator Backend](https://docs.commonbond.au/receptor/docs/app-documentation/allocator-backend) | ✅ Complete |
| **Authentication & Onboarding** | All Apps (shared) | ✅ Complete |
| **Authentication & Onboarding** | All Apps (shared) | ✅ Complete |
| **Worker Operations** (Diary, Availability) | 🔴 Not yet assigned | 🔴 Not Started |
| **Operations Dashboard** | 🔴 Not yet assigned | 🔴 Not Started |
| **Listings** | 🔴 Not yet assigned | 🔴 Not Started |

---

## Reference Documents

| Document | Purpose |
|:---------|:--------|
| [Screens Inventory](./screens-inventory) | Complete list of Flutter screens with migration mapping |
| [Technical Inventory](./technical-inventory) | API layer, authentication, and data model documentation |
| [Architecture Analysis](./architecture-analysis) | Domain logic vs UI separation patterns |
| [Original Migration Plan](./original-migration-plan) | The original strangler-pattern migration strategy |

---

## Repository Location

The legacy Flutter code is located at:
- **Repository**: [rotator_worker](https://github.com/dm-ra-01/rotator_worker)
- **Status**: Maintenance mode (critical fixes only)
- **README**: [Flutter App Documentation](https://receptor.commonbond.au/docs/app-documentation/frontend-apps/receptor-management)

---

## Related Documentation

- [Frontend Redevelopment Project](https://docs.commonbond.au/receptor/docs/projects/frontend-redevelopment) — Overall migration tracking
- [Core Suite Architecture](https://docs.commonbond.au/receptor/docs/app-documentation/architecture) — Current system design
- [Legacy to New Migration Guide](../legacy-to-new-migration) — Database migration details
