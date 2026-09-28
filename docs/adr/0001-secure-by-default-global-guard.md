# 0001. Secure by default: global guard with opt-in public routes

- Status: Accepted, authentication mechanism superseded by [ADR 0005](0005-jwt-global-guard.md)
- Date: 2026-09-26

## Context

Access control added per route with `@UseGuards()` fails open. If a new endpoint forgets the decorator, it becomes public without anyone noticing.

## Decision

`ApiKeyGuard` is registered globally through `APP_GUARD`. Every route requires the `x-api-key` header unless it is explicitly marked with the `@Public()` decorator. The guard reads this metadata with `Reflector.getAllAndOverride`, so the decorator works on both handlers and controllers.

## Consequences

- Forgetting a decorator now fails closed (401 Unauthorized) instead of leaking data.
- Every public route is visible in code review, because it has to be marked `@Public()`.
- The static API key is an interim mechanism. It will be replaced by per-user JWT authentication, and the global, opt-out design stays the same.
