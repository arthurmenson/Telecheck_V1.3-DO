## Summary

- Service/Area:
- Change type: [ ] feature [ ] fix [ ] chore

## Checklists

- [ ] OpenAPI updated (if applicable) in `contracts/` and compatible or version-bumped
- [ ] SDK regenerated: `npm run gen:sdk`
- [ ] Unit tests pass for changed service(s)
- [ ] Integration tests (Testcontainers) pass (if DB/Redis used)
- [ ] Pact provider verification passes (if consumer pact exists)
- [ ] Playwright smokes still green (no UI edits introduced)
- [ ] Wiring verifier: endpoints implemented and routed
- [ ] SBOM generated (CI)
- [ ] No console logs / secrets / PII in logs

## Notes

- Risk/rollout:
- Flags:
