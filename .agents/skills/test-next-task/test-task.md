# Test one plan task

Wave subagents do not edit `plan.md` or production files. They return a recommended status to the parent.

## Read

- Sibling `spec.md` and this task's complete block in `plan.md`.
- The implemented production files, their public callers, neighboring tests, runner configuration, and relevant ADRs.
- `.agents/skills/tdd/SKILL.md`, including `tests.md` and `mocking.md`.
- `.agents/skills/react-testing/SKILL.md`.
- `.agents/skills/property-based-testing/SKILL.md`; load only the reference it routes to for the current test decision.
- `.agents/skills/playwright/SKILL.md`; load only the references needed for the selected browser scenarios.

The implementation already exists at this gate. Apply the TDD skill's public-seam, behavior, independence, and boundary-mocking rules, but do not mutate production code merely to manufacture a red step or claim that post-implementation tests were written first.

## Design coverage

Map every acceptance criterion to an observable assertion at the narrowest reliable public seam. Add distinct cases only when they can detect a distinct defect:

- expected behavior and state transitions;
- empty, boundary, invalid, failure, timeout, and recovery behavior relevant to the change;
- external boundaries with realistic fixtures and boundary-level mocks;
- regression cases for the task's stated risk;
- keyboard, focus, accessible names, reflow, viewport, navigation, and real-browser behavior for affected UI;
- invariants, round trips, idempotence, ordering, or oracle comparisons when the implementation has a property-based shape.

Use existing test libraries and repository patterns. If property-based testing is valuable but no library is installed, do not add one without user approval; write deterministic boundary tables and report the exact property a future generator should cover. Do not chase line coverage, duplicate equivalent cases, snapshot unstable markup, or assert source text when behavior is observable.

## Write

- Edit only tests, fixtures, snapshots reviewed as intentional, test-only helpers, and the minimum test-runner configuration or test dependency manifests required by the approved scope.
- Never fix or reshape production code. Preserve a failing test that proves an implementation defect and return the task to `pending`.
- Use React Testing Library for client component behavior when its dependencies and environment already exist. Keep server-component and pure-function tests in the repository's established Vitest style.
- Use Playwright for cross-page flows, layout, browser APIs, responsive behavior, accessibility interaction, downloads, popups, or external-navigation behavior. Mock third-party network boundaries, not the application behavior under test.
- Use property-based tests only for a strong property over a meaningful input domain; otherwise prefer explicit examples.

## Verify

1. Run the narrowest affected test files while authoring.
2. Run every new or changed browser spec when Playwright coverage is added.
3. Run repository-required `make build`, `make test`, and `make lint` checks.
4. Run `make e2e` when the task changes user-visible behavior or any E2E fixture/spec.
5. Treat skipped tests, unexpected console errors, flaky retries, or an untested acceptance criterion as incomplete work.

## Return

Report:

- task id and title;
- acceptance-criterion-to-test mapping;
- test, fixture, and configuration paths changed;
- targeted and repository verification outcomes;
- production defects, missing infrastructure, or untested criteria;
- recommended status: `code_review`, `pending`, `blocked`, or `testing`.
