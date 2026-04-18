# Skill: Full-Stack Validation

## Goal

Provide a repeatable validation sequence before declaring features complete.

## Validation Sequence

1. Install backend and frontend dependencies.
2. Start backend and verify GET /health returns HTTP 200.
3. Start frontend and verify the app renders without console/runtime errors.
4. Upload a sample CT image and verify API-backed prediction response.
5. Run frontend production build and backend syntax checks.
6. Document observed behavior and known limitations.

## Exit Criteria

- No mocked inference path is used in the UI.
- Prediction endpoint is reachable from the frontend origin.
- Build passes with no compile errors.
