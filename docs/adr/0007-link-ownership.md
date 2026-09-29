# 0007. Links have an owner, and only the owner can delete them

- Status: Accepted
- Date: 2026-09-29

## Context

After the global JWT guard (ADR 0005), any authenticated user could delete any link with `DELETE /links/:code`. Authentication answered "who are you?", but nothing answered "is this yours?". This is Broken Object Level Authorization, the first item in the OWASP API Security Top 10.

## Decision

- **Every link has a required owner.** `links.userId` is a `NOT NULL` foreign key to `users`, indexed, with `ON DELETE CASCADE`. Creating a link requires a JWT, and the owner is taken from the token, never from the request body.
- **The service checks ownership.** `LinksService.remove` receives the caller's `userId` and compares it with `link.userId` before deleting. The service depends on a plain `userId`, not on the authenticated user object, so it stays independent of the HTTP and auth layers.
- **403, not 404, for someone else's link.** Returning 404 is the safer default when the existence of a resource is secret, because it does not confirm that the resource exists. Here `GET /links/:code` is public, so existence is not secret. A 404 would hide nothing and would make "not found" and "not allowed" impossible to tell apart.

## Consequences

- Links can no longer be created anonymously.
- The migration adds a required column without a default, so it only applies to an empty `links` table. On a live database this would be done in steps: add the column as nullable, backfill it, then set `NOT NULL`.
- Deleting a user deletes their links and, through the existing cascade, their clicks.
- Ownership is checked in the service, not in a guard. Role-based rules, such as an admin deleting any link, will be added on top of this check.
