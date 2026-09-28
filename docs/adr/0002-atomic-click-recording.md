# 0002. Record a click and update the link in one transaction

- Status: Accepted
- Date: 2026-09-28

## Context

A redirect makes two writes. It inserts a row into `clicks` and updates `links.lastClickedAt`. `lastClickedAt` is denormalized, because the same value could be derived as `MAX(clicks.createdAt)`. It is stored so that link listings stay cheap. If only one of the two writes succeeds, the copy drifts from the source of truth.

## Decision

Both writes run in a single `prisma.$transaction([...])` in `LinksService.resolve`. The writes do not depend on each other's results, so the array (batch) form is enough and an interactive transaction is not needed.

## Consequences

- The two writes succeed or fail together. `lastClickedAt` can never contradict `clicks`.
- If the transaction fails, the click is not recorded and the request fails with 500. The visitor is not redirected, so that visit never completed in the first place.
- Guaranteed click capture under database failures is a separate concern. It is planned as asynchronous ingestion through a queue.
