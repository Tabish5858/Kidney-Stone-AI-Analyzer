# Repository Copilot Instructions

## Product Context

- This repository is a full-stack AI application for kidney CT scan classification.
- Classes are Normal, Cyst, Stone, and Tumor.
- The backend is Flask + TensorFlow and the frontend is React + Vite + TypeScript.

## Delivery Standard

- Treat all changes as enterprise production work.
- Prioritize correctness, security, maintainability, and auditability.
- Do not ship placeholder logic, fake results, or mocked production paths unless explicitly requested.
- Keep changes small, reviewable, and focused.

## Engineering Requirements

- Validate changes locally before completion.
- For frontend changes, run build and lint when possible.
- For backend changes, run syntax checks and endpoint smoke checks when possible.
- Add or update documentation when behavior, setup, or API contracts change.

## Security and Compliance Guardrails

- Never commit secrets, tokens, keys, or credentials.
- Avoid logging sensitive medical image content or personal data.
- Use strict input validation for uploaded files.
- Prefer explicit allowlists for CORS and external origins.

## Backend Conventions

- Keep API responses predictable and JSON-only.
- Return actionable error messages with correct status codes.
- Resolve model and config file paths relative to backend source files.
- Keep health endpoints lightweight.

## Frontend Conventions

- Route all inference requests through configured API base URL values.
- Handle loading, error, and success states explicitly.
- Avoid hidden side effects in UI components.
- Keep components accessible and keyboard-friendly.

## Pull Request Expectations

- Include what changed, why, risk level, and verification steps.
- Call out breaking changes and migration notes clearly.
- Include screenshots for UI changes.
