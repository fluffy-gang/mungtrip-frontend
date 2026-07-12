# Mungtrip Frontend Agent Guide

## Expo SDK 57

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

This project uses Expo SDK 57, React Native 0.86, React 19.2.3, and Expo Router. Prefer Expo Router APIs from `expo-router`; do not add direct app-level imports from external `@react-navigation/*` packages unless the SDK 57 docs explicitly require it.

## Workflow Rules

- Branch names must use `{tag}/{task-title}-#{issue-number}`, for example `feat/auth-api-client-#1`.
- Commit messages must use `[#{issue-number}] {commit title}`. Optional body lines should use dash-prefixed list items.
- Before implementing, inspect existing shared code in `src/components`, `src/hooks`, `src/constants`, and any future `src/shared` or `src/features` modules.
- Prefer high cohesion and low coupling. Extract shared modules when behavior is reused or clearly belongs to a stable boundary.
- Keep engineering proportionate to this app's maturity. Avoid broad architecture layers before the product shape requires them.
- Think like a senior engineer: make secure, performant, maintainable choices and call out risk explicitly.

## Architecture Rules

- Keep Expo Router route files in `src/app`.
- Keep reusable UI in `src/components`; use `src/components/ui` for primitive shared controls.
- Keep cross-screen hooks in `src/hooks` and constants/design tokens in `src/constants`.
- When a feature grows beyond a single route, introduce `src/features/{feature}` with colocated UI, hooks, and domain helpers.
- Shared modules must include concise comments describing public behavior, constraints, and platform-specific assumptions.
- If a common module would make a new implementation clearer, define the module first and consume it from the feature implementation.

## Documentation Rules

- For complex architecture, security, performance, dependency, or product tradeoff decisions, ask whether to document the decision before coding.
- Use lightweight ADRs under `docs/adr/` for approved decision records.
- When code related to an ADR changes, update the ADR in the same change.
- If a developer requests a decision that conflicts with current best practice, ask for the reason and document the rationale in an ADR or PR notes.

## Review And Tracking Rules

- Pull requests and issues must follow the templates under `.github`.
- Deferred work must be traceable. Use `TODO(#123): description` or `TODO(docs/adr/0001-title.md): description`.
- Do not add untracked fixme or hack markers. Convert them to traceable deferred work or resolve them before committing.

## LLM Collaboration

- Use this file as the source of truth for Codex, Claude, and other LLM agents.
- For large changes, split work into independent scopes. Explorer-style agents may inspect code and documents; worker-style agents may edit only clearly assigned, non-overlapping files.
- Agents must not revert unrelated user changes. If a dirty file is unrelated to the task, leave it alone.
