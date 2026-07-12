# Frontend Architecture

This app is currently an early Expo Router project. The architecture should stay lightweight while making common code easy to find and reuse.

## Current Stack

- Expo SDK 57
- React Native 0.86
- React 19.2.3
- Expo Router with typed routes enabled
- TypeScript strict mode

## Module Boundaries

- `src/app`: route files and route layouts only.
- `src/components`: reusable UI components.
- `src/components/ui`: shared UI primitives.
- `src/hooks`: cross-screen React hooks.
- `src/constants`: design tokens, app constants, and platform-safe static configuration.
- `src/features/{feature}`: introduce when a feature grows beyond one route or needs colocated UI, hooks, and helpers.

## Shared Code

Before adding new code, search for an existing component, hook, helper, or constant. If a behavior is reused or has a stable responsibility, create the shared module first and use it from the implementation.

Shared modules must include concise comments for public behavior, platform assumptions, and constraints that are not obvious from the type signature.

## Expo And React Native Practices

- Follow the SDK 57 docs before adding Expo or React Native APIs.
- Prefer `expo-router` APIs for navigation.
- Keep platform-specific files explicit with `.ios`, `.android`, or `.web` suffixes when behavior differs.
- Avoid direct app-level imports from external `@react-navigation/*` packages unless the SDK 57 docs require it.
- Keep route files thin as features grow; move reusable logic into feature or shared modules.

## Engineering Standard

- Optimize first for correctness, security, maintainability, and clear ownership.
- Do not add broad abstractions before the code has enough repetition or domain shape to justify them.
- Document accepted best-practice exceptions in an ADR or PR notes.
- Make deferred work traceable with an issue or ADR link.
