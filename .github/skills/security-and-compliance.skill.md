# Skill: Security and Compliance Baseline

## Goal

Apply a baseline of secure engineering controls suitable for enterprise teams.

## Required Controls

- Input validation on upload endpoints.
- Restricted CORS configuration with explicit origin allowlist.
- No committed secrets or credentials.
- Consistent error handling with no sensitive stack traces exposed to clients.
- Dependency updates handled through routine patch cadence.

## Review Checklist

- Any new endpoint has authentication/authorization expectations documented.
- Any file upload path has type and size constraints.
- Any external network call has timeout/error handling.
- Any change affecting security has tests or validation notes in PR.
