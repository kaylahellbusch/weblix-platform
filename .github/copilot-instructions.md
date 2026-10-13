# Copilot Instructions

Weblix Platform is a full-stack application for managing business data and generating customizable business websites.

## Architecture
- Use **TypeScript** throughout. Start with **Next.js** in `apps/web` for UI, server-side APIs, and AI content generation; use **Supabase** for persistence.
- Do not introduce a separate `apps/api` service, worker, or shared package without a concrete need.
- Support manual business entry and CSV imports; do not add automated business discovery or scraping.
- Prefer React Server Components unless client-side interactivity is needed. Keep data access and business logic separate from presentation.

## Development Standards
- Make small, focused changes; follow existing conventions and avoid unnecessary dependencies or abstractions.
- Use strict types; avoid `any`. Validate user input, CSV data, and AI output at system boundaries (prefer Zod).
- Build responsive, accessible interfaces with useful loading, empty, error, and success states.
- Handle failures explicitly. Add meaningful tests for business logic, edge cases, and security boundaries.
- Run applicable lint, type, test, and build checks; report what was actually run and any failures.
- Keep secrets and privileged Supabase operations server-side; enforce appropriate access controls.

## Collaboration
- Before substantial changes, briefly propose the approach and important tradeoffs.
- Explain new patterns or dependencies rather than adding them silently.
- After changes, summarize what changed, why, and how it was verified.
- Favor understandable code the project owner can maintain over clever or overly elaborate solutions.
- Update the root README only when a change affects documented functionality, architecture, setup instructions, or configuration. Keep it concise and accurate, and never describe planned features as already implemented. Don't rewrite it for unrelated changes.

## Public Repository
Everything committed here is public. Never commit credentials, `.env` files, private URLs, real customer/business data, or private project history. Use synthetic examples and environment-variable placeholders. Document architecture decisions concisely without including private migration notes.
