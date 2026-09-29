# 0008. Load the user from the database on each authenticated request

- Status: Accepted
- Date: 2026-09-29
- Supersedes the stateless token check of [ADR 0005](0005-jwt-global-guard.md)

## Context

ADR 0005 made `JwtStrategy` trust the verified token payload without a database query. That was acceptable while a token only carried an identity. Users now have a role (`USER` or `ADMIN`), and authorization decisions depend on it.

If the role were read from the token, a change would not take effect until the token expired. An admin whose role is removed would keep admin rights for up to 15 minutes, and a deleted user's token would keep working for the same time.

## Decision

`JwtStrategy.validate` verifies the token, then loads the user by `sub` with `UsersService.findById`. If the user no longer exists, the request fails with 401. `request.user` is built from the database row (`id`, `email`, `role`), not from the token payload.

The role is not stored in the token. `findById` omits `passwordHash`, so the hash never reaches the guard or `request.user`.

## Consequences

- Role changes and deleted accounts take effect on the next request, not after the access token expires.
- Every authenticated request costs one primary key lookup. The busiest route, `GET /:code`, is public and skips the guard, so it is not affected. If authenticated traffic grows, the lookup can be cached with a short TTL.
- Access tokens are no longer self-contained. Another service cannot authorize a request from the token alone. It has to call this API or share the database.
- The first admin cannot be created over HTTP. Registration ignores any `role` field, and roles are assigned outside the API.
