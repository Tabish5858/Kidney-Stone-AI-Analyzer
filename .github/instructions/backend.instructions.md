---
applyTo: "backend/**"
---

# Backend Implementation Instructions

- Keep endpoint behavior deterministic and status-code correct.
- Validate request payloads and uploaded files defensively.
- Handle model inference errors gracefully and return safe error details.
- Do not rely on working directory assumptions for model or config file paths.
- Keep CORS origin lists explicit and configurable via environment variables.
- Add lightweight health checks for runtime readiness.
- Avoid introducing debug-mode defaults for production execution paths.
