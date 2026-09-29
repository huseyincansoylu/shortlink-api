# Security overview

How shortlink addresses the [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/), and where known gaps remain.

| Risk                                                 | Status         | How it is handled                                                                                                                                                                                                             |
| ---------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API1 Broken Object Level Authorization               | Addressed      | Every link has an owner taken from the JWT. Only the owner or an admin can delete it, and `GET /links/mine` filters by owner ([ADR 0007](adr/0007-link-ownership.md)).                                                        |
| API2 Broken Authentication                           | Addressed      | Argon2id password hashes, 15-minute access tokens, rotated refresh tokens with reuse detection ([ADR 0006](adr/0006-refresh-token-rotation.md)), 5 login attempts per minute per IP.                                          |
| API3 Broken Object Property Level Authorization      | Addressed      | Request bodies are whitelisted, so unknown fields such as `role` are rejected. Password hashes and creator IP addresses are excluded at the query level.                                                                      |
| API4 Unrestricted Resource Consumption               | Addressed      | Rate limiting on every route ([ADR 0010](adr/0010-rate-limiting.md)). List endpoints cap `limit` at 100.                                                                                                                      |
| API5 Broken Function Level Authorization             | Addressed      | Admin-only routes use `@Roles('ADMIN')` and a global `RolesGuard` ([ADR 0009](adr/0009-role-based-access-control.md)). Roles are read from the database on every request ([ADR 0008](adr/0008-load-user-on-each-request.md)). |
| API6 Unrestricted Access to Sensitive Business Flows | Partial        | Link creation requires an account and is rate limited, but it has no stricter limit of its own.                                                                                                                               |
| API7 Server Side Request Forgery                     | Not applicable | The server never requests the URLs it stores. It only redirects the client to them.                                                                                                                                           |
| API8 Security Misconfiguration                       | Addressed      | Security headers with `helmet`, CORS restricted to configured origins, environment variables validated at startup.                                                                                                            |
| API9 Improper Inventory Management                   | Partial        | All endpoints are listed in the README, but there is no OpenAPI description or API versioning.                                                                                                                                |
| API10 Unsafe Consumption of APIs                     | Not applicable | The service does not call third-party APIs.                                                                                                                                                                                   |

## Known gaps

- **Login timing.** When the email is unknown, the password hash check is skipped, so the response is slightly faster. Timing could reveal which accounts exist.
- **Internal ids.** Database ids appear in responses.
- **Rate limit storage.** Counters are kept in memory. They reset on restart and are not shared between instances.
- **Client IP behind a proxy.** Rate limits use `request.ip`. Behind a reverse proxy, the proxy must be trusted explicitly, or all clients share one limit.
- **Unexpected errors.** Unhandled exceptions return the framework's default 500 response instead of the common error format.
- **Access token lifetime.** After logout, an access token stays valid until it expires, at most 15 minutes.
