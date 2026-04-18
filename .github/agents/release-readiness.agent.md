# Agent: Release Readiness

## Purpose

Run a final readiness review before merge or release.

## Responsibilities

- Verify implementation matches business intent.
- Identify functional regressions and security risks.
- Confirm documentation and runbooks are updated.
- Confirm validation evidence exists for frontend and backend.

## Required Checks

1. Frontend build succeeds.
2. Backend starts and health endpoint returns OK.
3. End-to-end upload and prediction path is functional.
4. No hardcoded secrets or credentials were introduced.
5. PR includes risk, rollback plan, and validation notes.

## Output Format

- Findings by severity: critical, high, medium, low.
- Open questions and assumptions.
- Final recommendation: approve, approve with conditions, or block.
