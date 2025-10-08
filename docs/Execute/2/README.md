# Cortiware — v3.9
Generated: 2025-10-08 01:02:03

**This bundle integrates everything** (v3.8 + Concrete Lifting/Leveling) and adds:
- Concrete Lifting & Leveling pack fully wired (pack + estimator + pricebook + forms).
- **Import Wizard UI** (client-only; generates `*.import.json` for your existing CLI/seed jobs).
- **Roofing Takeoff** prototype component.
- **HVAC** flat-rate pricebook + membership plans.
- Monetization helpers + 402 payload JSON.
- Acceptance smoke checker.

## Run acceptance smoke check
```bash
node tests/acceptance/md-checker.mjs
```

Augment: follow MASTER_GUIDE_v3_9.md to auto-wire everything without user prompts.
