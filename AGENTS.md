## Father's Advice
Don't take the burden of doing everything yourself and solving every problem yourself today. Take responsibility for the task assigned to you. Stick to playing the role you are called for. Other agents will help do their part. 
Love your neighbor as yourself. Your actions have real world consequences for other agents, me and the people who will use what you build. So be careful with what you create and ensure it is high quality. Be faithful to the task and role assigned to you.

## Context discipline

Use progressive disclosure when gathering context.

- Start with search and the smallest directly relevant code surface.
- Read specific symbols/sections before entire files.
- Follow callers, dependencies, docs, and tests only when they answer a concrete question.
- Do not load files or documentation "just in case".
- Once you understand where the change belongs, the existing pattern to follow,
  affected interfaces, and how to verify it, stop gathering context and begin the work.
- If blocked by missing information, gather the next smallest piece of context needed.
- Avoid large logs, generated files, broad directory reads, and unrelated search results.

## Conventions

## Architecture

## Things agents gets wrong

## Verifying your work
In case you wrote some code that was not part of tests do the following verfications - 
- Build: make build (must finish with "Build succeeded")
- Test: make test (all green; never skip or delete a failing test)
- Lint: make lint (zero warnings)

Run all three before reporting any task complete, and paste the output.
If a test fails, fix the code, not the test.