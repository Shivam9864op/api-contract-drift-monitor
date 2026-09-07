# Interview notes

## The problem

An API change can leave the service's own tests green while breaking a consumer. A removed operation, a newly required query parameter, or a changed success-response type may only show up after deployment.

## What this demo does

It compares two local OpenAPI JSON documents and turns the differences into a small report. Breaking changes make the CLI exit with code `1`, so a pull request check can stop before deployment. Additive changes exit with code `0`.

## Why the rules are narrow

The demo is intentionally deterministic. It does not pretend to replace a complete schema-compatibility platform. Keeping the rules small makes each result explainable and easy to test.

## How I tested it

- An additive endpoint is allowed.
- A removed operation, changed response type, and new required parameter are all reported.
- Empty documents do not crash the comparison.
- The same fixtures produce the same JSON report every time.

## What I would add next

Property-level schema diffs, an allow-list for intentional breaking changes, and annotations that point directly to the pull-request line would be useful next steps.
