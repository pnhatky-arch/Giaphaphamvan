# Giaphaphamvan — Mobile Liquid Glass Baseline

Baseline date: 2026-09-28

## Source of truth
- UI geometry follows `PHAM_GIA_UI_DESIGN_SYSTEM_LOCK.md`.
- Backup/storage flows follow `SETTINGS_DATA_REUSE_GUIDE.md`.
- Theme: Liquid Glass, red/burgundy accent, mobile-first.
- Data architecture: local-first, cloud-second.

## Restored genealogy data
The repository currently contains only the 16 members / 4 generations that were actually readable from the ChatGPT Site projection. No additional names or relationships are fabricated. More data should be imported through verified source data or a validated backup.

## Runtime modules
- `public/data.js`: verified restored seed data.
- `public/backup-engine.js`: local persistence, JSON backup/share/restore, account/schema validation, last-good snapshot.
- `public/storage-engine.js`: usage/quota/persistent-storage controls.
- `public/cloud-adapter.js`: Google Identity Services + Google Drive `appDataFolder`, sync, backup, restore, conflict resolution.
- `public/app.js`: navigation, tree/member/event/document CRUD, settings, shared action sheet/confirm flow.
- `public/styles.css`: locked geometry + red Liquid Glass light/dark material.
- `public/sw.js`: offline shell/cache.

## Safety invariants
- Never serialize OAuth access tokens, passwords or secrets into backup JSON.
- Restore must validate app + schema + account and snapshot current data before replacement.
- Cloud failure must not block local CRUD.
- Permanent `Dùng bản máy / Dùng bản Cloud` controls are forbidden; conflict choices appear only in an explicit conflict flow.
- Destructive actions use the shared confirmation modal.

## Validation
Run:

```bash
npm test
```

This performs JS syntax checks and a static architecture audit.
