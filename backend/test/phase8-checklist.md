# RepoAssistant — Phase 8 Verification

## 1. Foundation
- [ ] Backend starts successfully.
- [ ] Frontend starts successfully.
- [ ] GET /api/health returns HTTP 200.
- [ ] Neon PostgreSQL connection is healthy.
- [ ] No secrets are exposed to the frontend.

## 2. GitHub
- [ ] GitHub OAuth login works.
- [ ] Logout invalidates the session.
- [ ] Repository list shows authorized repositories.
- [ ] Private repositories require proper authorization.

## 3. Repository Analyzer
- [ ] Repository file listing works.
- [ ] Individual files can be read.
- [ ] Code search returns relevant results.
- [ ] Unsafe file paths are rejected.

## 4. Docker Sandbox
- [ ] Sandbox health check succeeds.
- [ ] Test command executes inside the container.
- [ ] Execution timeout is enforced.
- [ ] Container resource limits are enforced.
- [ ] Host files cannot be accessed unexpectedly.

## 5. AI Agent
- [ ] Agent accepts a coding task.
- [ ] Agent can inspect repository context.
- [ ] Agent tools validate their arguments.
- [ ] Agent respects iteration and execution limits.
- [ ] Failed tests do not get reported as passed.

## 6. Git Workflow
- [ ] Proposed diff can be reviewed.
- [ ] Approval is stored and verified by the backend.
- [ ] Rejected changes cannot be published.
- [ ] A task branch is created.
- [ ] Changes are committed and pushed.
- [ ] Pull request creation succeeds.
- [ ] Repeated requests do not create unintended duplicates.

## 7. Final verification
- [ ] Existing Phase 5 tests pass.
- [ ] Phase 8 automated tests pass.
- [ ] All required manual checks pass.
- [ ] No critical security issues remain.

Phase 8 is complete only when the relevant checks
have actually passed. A pending or untested item
must not be marked complete.
