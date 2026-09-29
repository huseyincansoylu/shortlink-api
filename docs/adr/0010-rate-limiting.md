# 0010. Rate limiting with a global throttler guard

- Status: Accepted
- Date: 2026-09-29

## Context

Any client could send an unlimited number of requests. The login endpoint allowed unlimited password guesses, and each guess costs an Argon2 verification, which is slow by design. Registration and link creation could be automated to create accounts and links in bulk.

## Decision

`@nestjs/throttler` is registered as a global `APP_GUARD`.

- **Default limit.** Every route allows 100 requests per minute. The counter is kept per client IP and per route, so a new endpoint is limited even if nobody configures it.
- **Stricter limits on credential endpoints.** `POST /auth/login` and `POST /auth/register` allow 5 requests per minute with `@Throttle()`.
- **Redirects are exempt.** `GET /:code` uses `@SkipThrottle()`. A popular link can be opened many times from one network, and blocking it would break the main feature. Only this handler is exempt, not the whole controller.
- **The throttler runs first.** It is registered before `JwtAuthGuard` and `RolesGuard`. A rejected request never reaches the database lookup of ADR 0008 or the password hash check. It only needs the IP, not the user.
- **Errors keep the common format.** Limited requests get `429 Too Many Requests` with a `Retry-After` header and the usual error body.

## Measurements

| Scenario                     | Result                  |
| ---------------------------- | ----------------------- |
| 105 requests to `GET /stats` | 100 × 200, then 5 × 429 |
| 7 failed logins              | 5 × 401, then 2 × 429   |
| 110 redirects to one link    | 110 × 302               |

## Consequences

- Counters live in memory. They reset when the process restarts, and with several instances each one counts separately, so the effective limit grows with the number of instances. A shared store such as Redis would fix both.
- Clients are identified by `request.ip`. Behind a reverse proxy every request would appear to come from the proxy, and all clients would share one limit, until the proxy is trusted explicitly.
- Many users behind one IP, such as an office or a mobile carrier, share a limit. Limits per authenticated user would be fairer on protected routes.
- A distributed attacker with many IPs is not stopped by per-IP limits alone.
