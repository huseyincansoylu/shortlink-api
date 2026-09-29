# 0005. Replace the shared API key with a global JWT guard

- Status: Accepted, stateless token check superseded by [ADR 0008](0008-load-user-on-each-request.md)
- Date: 2026-09-28
- Supersedes the authentication mechanism of [ADR 0001](0001-secure-by-default-global-guard.md)

## Context

ADR 0001 protected every route with a single static API key sent in the `x-api-key` header. It was intended as an interim mechanism. Now that users can register and log in, it has two problems:

- It does not identify the caller. Every client sends the same key, so a request cannot be attributed to a user, and ownership checks are not possible.
- It is a single shared secret. If one client leaks it, the key has to be rotated for everyone.

## Decision

`JwtAuthGuard` replaces `ApiKeyGuard` as the global `APP_GUARD`. It extends Passport's `AuthGuard('jwt')`, so every route requires a valid `Authorization: Bearer <token>` header unless it is marked `@Public()`. The `@Public()` check moved into the new guard unchanged.

`ApiKeyGuard` and the `API_KEY` environment variable were removed.

`JwtStrategy` trusts the verified token payload and does not query the database on each request.

## Consequences

- The secure-by-default design of ADR 0001 is unchanged: a route without `@Public()` fails closed with 401.
- Every authenticated request carries a user identity (`request.user`), which ownership and role checks can build on.
- `@Public()` now has one meaning, "no authentication required". Protected routes need no extra decorator.
- Token checks are stateless and cost no database query. A deleted user's token stays valid until it expires (15 minutes). Refresh token revocation is the planned mitigation.
- Machine-to-machine clients have no credential type yet. If they are needed, they should get per-user, revocable API keys, not a shared one.
