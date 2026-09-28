# 0006. Opaque refresh tokens with rotation and reuse detection

- Status: Accepted
- Date: 2026-09-28

## Context

Access tokens expire after 15 minutes (ADR 0005). Without another credential, users would have to log in again every 15 minutes. A long-lived access token would fix that, but it could not be revoked, because access tokens are verified without a database lookup.

## Decision

Login returns a short-lived JWT access token and a long-lived refresh token. `POST /auth/refresh` exchanges a refresh token for a new pair, and `POST /auth/logout` revokes it.

- **Opaque, not a JWT.** A refresh token is 32 random bytes, hex encoded. It is checked against the database on every use anyway, so a signed payload would add a second secret and no benefit.
- **Stored as a SHA-256 hash.** The random value has 256 bits of entropy, so a slow password hash is unnecessary. SHA-256 is deterministic, which lets the server look the token up by its hash. A leaked table cannot be used to refresh sessions.
- **Rotation.** Every refresh revokes the presented token and issues a new one in the same interactive transaction. Revoked rows are kept (`revokedAt`) instead of deleted.
- **Reuse detection.** If a revoked token is presented again, the server assumes it was stolen and revokes every active refresh token of that user.
- **Atomic claim.** A token is revoked with `UPDATE ... WHERE id = ? AND revokedAt IS NULL`, and the update count decides who won. PostgreSQL serializes concurrent updates to the same row, so exactly one request can use a token.

## Measurements

The same refresh token was sent in 5 concurrent requests, in 10 rounds:

| Implementation                            | Successful refreshes per round |
| ----------------------------------------- | ------------------------------ |
| Read `revokedAt`, then update by `id`     | 5 of 5 in most rounds          |
| Conditional update on `revokedAt IS NULL` | exactly 1 of 5 in every round  |

## Consequences

- Active users stay logged in: each refresh extends the session by 7 days. A user who is inactive for 7 days must log in again. There is no absolute session limit yet.
- A stolen refresh token works at most until the real user refreshes, and then all of that user's sessions end.
- Two tabs that refresh the same token at the same moment are treated as reuse, so the user has to log in again. Some systems allow a short grace period instead. This design prefers the stricter behavior.
- Logout revokes only the refresh token. The access token stays valid until it expires, at most 15 minutes. A denylist would close this gap, but it would need a lookup on every request.
- Revoked and expired rows accumulate and need a periodic cleanup job.
