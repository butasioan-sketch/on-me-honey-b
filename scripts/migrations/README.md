# Database Migrations

## How to run migrations

### Production (Neon Console)

1. Go to https://console.neon.tech
2. Select your production database
3. Open SQL Editor
4. Copy-paste the migration SQL
5. Execute

### Local (psql)

```bash
psql $DATABASE_URL < scripts/migrations/001-add-indexes.sql
```

### Verify

```bash
psql $DATABASE_URL -c "\d orders"  # Check indexes on orders table
```

## Migration Files

- `001-add-indexes.sql` - Performance indexes (INFRA P1 4.5)

## Safety

All migrations use `IF NOT EXISTS` / `IF EXISTS` to be idempotent.
Safe to run multiple times.
