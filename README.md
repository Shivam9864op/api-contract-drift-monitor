# API Contract Drift Monitor

Small, deterministic OpenAPI diff tool for catching breaking API changes before they reach a deployment.

![Tests](https://github.com/Shivam9864op/api-contract-drift-monitor/actions/workflows/test.yml/badge.svg)

This is a personal open-source demo using synthetic fixtures. It is not client work and it does not replace a full contract-testing platform.

## Why it exists

An API can be “green” in unit tests while quietly breaking consumers by removing an endpoint, deleting a response, changing a response type, or adding a required parameter. This tool turns those changes into a readable report and a non-zero exit code that can block CI.

## Run it

```bash
npm test
node src/cli.mjs fixtures/baseline.json fixtures/current-safe.json
node src/cli.mjs fixtures/baseline.json fixtures/current-breaking.json
```

The breaking fixture intentionally exits with code `1` and reports the exact change codes. The safe fixture exits with `0`.

## Example output

```json
{
  "breaking": 3,
  "nonBreaking": 0,
  "total": 3,
  "status": "blocked",
  "changes": [
    { "severity": "breaking", "code": "response_type_changed", "target": "GET /tickets" },
    { "severity": "breaking", "code": "required_parameter_added", "target": "GET /tickets query:team" },
    { "severity": "breaking", "code": "operation_removed", "target": "GET /tickets/{id}" }
  ]
}
```

Saved reports are also available in [`examples/`](examples/):

- [`safe-report.json`](examples/safe-report.json) — additive change, exit code `0`.
- [`breaking-report.json`](examples/breaking-report.json) — three breaking changes, exit code `1`.

## Design choices

- No network calls or credentials: fixtures are local and synthetic.
- Deterministic rules: the same two documents produce the same result.
- CI-friendly: exit `1` only when a breaking change is found.
- Narrow scope: this demo checks paths, required parameters, response presence, and simple response type changes.

## Next extensions

Schema property-level diffs, an allow-list for intentional changes, GitHub Actions annotations, and a Pact/contract-test adapter would be natural next steps.

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [docs/ci-example.yml](docs/ci-example.yml) for safe extension and CI guidance.

For a short explanation to use in a technical conversation, see [docs/interview-notes.md](docs/interview-notes.md).
