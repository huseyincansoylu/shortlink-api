# 0004. Keyset (cursor) pagination for click history

- Status: Accepted
- Date: 2026-09-28

## Context

`GET /links/:code/clicks` can return an unbounded number of rows. `OFFSET` pagination reads and then discards every skipped row, so deep pages get slower in proportion to their offset. Rows inserted between two requests also shift later pages, which leads to duplicates or skipped rows.

## Decision

Paginate on the primary key: `WHERE id > :cursor ORDER BY id LIMIT :limit`. The response carries `nextCursor`, the last `id` of the page, or `null` on the last page. `limit` is validated to the range 1–100.

## Measurements

The table held 200,000 rows. Each query fetched the same 20 rows deep in the table, measured with `EXPLAIN ANALYZE`:

| Strategy                              | Rows read | Execution time |
| ------------------------------------- | --------- | -------------- |
| `LIMIT 20 OFFSET 0`                   | 20        | 0.27 ms        |
| `LIMIT 20 OFFSET 199000`              | 199,020   | 40.69 ms       |
| `WHERE id > 199000 LIMIT 20` (keyset) | 20        | 0.035 ms       |

## Consequences

- Every page costs the same, however deep it is, and rows inserted concurrently do not shift pages.
- Clients cannot jump to an arbitrary page number or read a total page count. This fits feeds and infinite scroll, but not numbered page UIs.
- The cursor must use a unique, stable sort key. Sorting by a non-unique column such as `createdAt` would need a composite cursor of `(createdAt, id)`.
- When the row count is an exact multiple of `limit`, the last page still returns a `nextCursor`, and one extra request comes back empty. Fetching `limit + 1` rows removes this.
