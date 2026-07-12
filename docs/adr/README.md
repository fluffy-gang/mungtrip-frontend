# Architecture Decision Records

Use ADRs for decisions that materially affect architecture, security, performance, dependencies, or long-term maintainability.

## When To Write One

- A decision changes module boundaries or data flow.
- A dependency is added, replaced, or intentionally avoided.
- A best-practice exception is accepted.
- A security or performance tradeoff needs future context.

## Format

- Copy `docs/adr/0000-template.md`.
- Name the file `NNNN-short-title.md`.
- Keep entries concise and update them when related code changes.

## Agent Rule

Before implementing a complex decision, ask whether an ADR should be created. If an ADR already exists for the touched area, update it in the same change as the code.
