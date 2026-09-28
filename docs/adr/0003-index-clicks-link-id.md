# 0003. Index the `clicks.linkId` foreign key

- Status: Accepted
- Date: 2026-09-28

## Context

PostgreSQL does not create indexes for foreign keys automatically. Click counts per link, cursor pagination over a link's clicks and `ON DELETE CASCADE` all filter `clicks` by `linkId`.

## Decision

Add `@@index([linkId])` to the `Click` model (migration `add_clicks_link_id_index`).

## Measurements

The table held 200,000 rows. The query was `SELECT count(*) FROM clicks WHERE "linkId" = $1` for a selective value, run with `EXPLAIN ANALYZE`:

| Plan                                  | Rows read | Execution time |
| ------------------------------------- | --------- | -------------- |
| Seq Scan (no index)                   | 200,008   | 8.23 ms        |
| Index Only Scan (`clicks_linkId_idx`) | 0         | 0.17 ms        |

## Consequences

- Selective lookups are about 50× faster, and the cost stays nearly flat as the table grows.
- Every insert into `clicks` also updates the index, which adds a small write cost on a write-heavy table.
- For non-selective values (a link that owns most rows) the planner correctly keeps using a sequential scan. The index helps selective queries only.
