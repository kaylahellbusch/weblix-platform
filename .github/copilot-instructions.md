# Project Instructions

Weblix is a full-stack application for generating and serving customizable business websites.

## Repository Structure

- `apps/web` contains the frontend application.
- `apps/api` contains backend services, APIs, content generation, and persistence logic.

Additional shared packages may be introduced when there is a clear need.

## Development Rules

- Make small, focused, reviewable changes.
- Keep each change independently testable when practical.
- Do not make unrelated changes.
- Prefer simple implementations over unnecessary abstractions.
- Preserve strong TypeScript typing where applicable.
- Avoid `any` unless there is a clear reason for it.
- Follow existing project conventions before introducing new patterns or dependencies.
- Do not add dependencies unless they provide clear value.
- Add tests for meaningful business logic and important behavior.
- Run relevant tests, linting, formatting, and type checking after changes.
- Fix issues introduced by the current change, but do not opportunistically refactor unrelated code.

## Security and Public Repository Rules

Assume everything committed to this repository will be publicly visible.

Never add:
- Credentials
- API keys
- Tokens
- `.env` files
- Production data
- Real customer or business data
- Private URLs or internal identifiers

Use environment-variable placeholders and synthetic/demo data where needed.

## Code Quality

Code should be understandable to another experienced engineer reviewing the repository.

Prioritize:
- Clear naming
- Straightforward architecture
- Useful tests
- Good error handling
- Strong typing
- Maintainability
- Documentation for non-obvious architectural decisions

Do not add complexity solely to make the project appear more sophisticated.