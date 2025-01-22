# Data Management Scripts

This directory contains scripts for managing database data, backups, and initialization.

## Backup and Restore

### Backup Database
```bash
npx tsx data/backup.ts
```
This will create a new backup in the `data/backups` directory with:
- Full database dump
- Current schema
- Backup info file

### Restore Database
```bash
npx tsx data/restore.ts <backup-directory>
```
Example:
```bash
npx tsx data/restore.ts 2025-01-20T13-00-00-000Z
```

## Points Management

### Recharge Merchant Points
```bash
npx tsx data/recharge-merchant.ts
```
- Adds 1000 points to each merchant
- Creates transaction records for the recharge

### Recharge Player Points
```bash
npx tsx data/recharge-player.ts
```
- Adds 500 points to each player
- Creates transaction records for the recharge

## Data Structure
The backup directory structure:
```
data/
  ├── backups/
  │   └── [timestamp]/
  │       ├── database.sql
  │       ├── schema.prisma
  │       └── backup-info.json
  ├── backup.ts
  ├── restore.ts
  ├── recharge-merchant.ts
  ├── recharge-player.ts
  └── README.md
``` 