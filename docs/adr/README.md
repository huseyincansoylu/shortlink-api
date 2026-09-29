# Architecture Decision Records

Short records of the decisions that shaped shortlink. Each one explains the context, the decision and what it costs.

| #    | Decision                                                                                            | Status                                   |
| ---- | --------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 0001 | [Secure by default: global guard with opt-in public routes](0001-secure-by-default-global-guard.md) | Accepted, mechanism superseded by 0005   |
| 0002 | [Record a click and update the link in one transaction](0002-atomic-click-recording.md)             | Accepted                                 |
| 0003 | [Index the `clicks.linkId` foreign key](0003-index-clicks-link-id.md)                               | Accepted                                 |
| 0004 | [Keyset (cursor) pagination for click history](0004-cursor-pagination.md)                           | Accepted                                 |
| 0005 | [Replace the shared API key with a global JWT guard](0005-jwt-global-guard.md)                      | Accepted, token check superseded by 0008 |
| 0006 | [Opaque refresh tokens with rotation and reuse detection](0006-refresh-token-rotation.md)           | Accepted                                 |
| 0007 | [Links have an owner, and only the owner can delete them](0007-link-ownership.md)                   | Accepted                                 |
| 0008 | [Load the user from the database on each authenticated request](0008-load-user-on-each-request.md)  | Accepted                                 |
| 0009 | [Role checks in a global guard, ownership checks in the service](0009-role-based-access-control.md) | Accepted                                 |
| 0010 | [Rate limiting with a global throttler guard](0010-rate-limiting.md)                                | Accepted                                 |
