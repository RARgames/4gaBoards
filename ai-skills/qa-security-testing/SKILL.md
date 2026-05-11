---
name: qa-security-testing
description: Design pragmatic security-focused QA checks for web applications. Use when Codex needs to plan or automate tests for authentication, authorization, sessions, input validation, direct API access, or sensitive workflow abuse while keeping security scope separate from functional smoke testing.
---

# QA Security Testing

## Workflow

1. Identify the protected resource or action.
2. Identify actors: anonymous user, valid user, non-member, member, editor, admin.
3. Test UI access and direct API access separately.
4. Verify both read and mutation permissions.
5. Confirm failed authorization does not leak sensitive data.
6. Check session behavior: login, logout, expired or missing token.
7. Keep destructive or intrusive testing out of shared environments.

## Candidate Checks

- Anonymous user cannot access a board URL.
- Non-member cannot read a private board through UI or API.
- Viewer cannot create, update, move, or delete cards.
- Invalid token redirects to login or receives unauthorized API response.
- Login errors do not reveal whether username or password was wrong.
- Required fields reject empty or malformed input.

## Output

Produce:

- Threat or risk
- Actor
- Preconditions
- Steps
- Expected result
- Automation approach
- Data cleanup needs
