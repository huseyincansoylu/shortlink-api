# 0009. Role checks in a global guard, ownership checks in the service

- Status: Accepted
- Date: 2026-09-29

## Context

Users have a role, `USER` or `ADMIN` (ADR 0008). Two kinds of rules depend on it:

- Some routes are for admins only, such as listing users.
- Some routes are open to every user, but the outcome depends on the resource. A user can delete their own link, and an admin can delete any link.

## Decision

- **Route-level rules use `@Roles()` and a global `RolesGuard`.** `@Roles('ADMIN')` stores the allowed roles as metadata on a handler or a controller, and `RolesGuard` reads it with `Reflector`. A route without `@Roles()` is not affected. The guard is registered as an `APP_GUARD` after `JwtAuthGuard`, so `request.user` is already loaded when it runs. If there is no user, it denies access instead of throwing.
- **Resource-level rules stay in the service.** "Owner or admin" needs the link, and a guard only sees the route. `LinksService.remove` receives the caller's id and role and applies the rule. A guard that loads the link would read it twice, couple a generic guard to the links domain, and protect only HTTP callers.
- **Admin endpoints live in their domain module.** `GET /users` is in `UsersModule` with `@Roles('ADMIN')` on the controller class, not in a separate `AdminModule`. An admin module would depend on every other module over time.

## Consequences

- An admin-only endpoint needs one decorator, and it cannot be forgotten on a new method of an admin-only controller.
- Unauthenticated requests get 401 from `JwtAuthGuard`, and authenticated requests without the role get 403 from `RolesGuard`.
- Guard order depends on the order of the `APP_GUARD` providers in `AppModule`.
- Ownership rules are spread across services. If many resources need the same kind of rule, a policy layer such as CASL can centralize them.
